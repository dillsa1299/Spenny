// JSON auth routes: local register, sign-in, verification, password reset, and session introspection.
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Spenny.Api.Data;

namespace Spenny.Api.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapSpennyAuthEndpoints(this IEndpointRouteBuilder api)
    {
        var auth = api.MapGroup("/auth");

        auth.MapPost("/register", RegisterAsync);
        auth.MapPost("/login", LoginAsync);
        auth.MapPost("/logout", LogoutAsync).RequireAuthorization();
        auth.MapGet("/session", GetSessionAsync).AllowAnonymous();
        auth.MapPost("/resend-verification", ResendVerificationAsync).AllowAnonymous();
        auth.MapPost("/confirm-email", ConfirmEmailAsync).AllowAnonymous();
        auth.MapPost("/forgot-password", ForgotPasswordAsync).AllowAnonymous();
        auth.MapPost("/reset-password", ResetPasswordAsync).AllowAnonymous();

        return api;
    }

    private static IResult? DatabaseUnavailable(HttpContext context)
    {
        if (!context.RequestServices.IsAuthConfigured())
        {
            return Results.Problem(
                title: "Authentication unavailable",
                detail: "Configure a PostgreSQL connection string to enable accounts.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        return null;
    }

    private static async Task<IResult> RegisterAsync(
        [FromBody] RegisterRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager,
        ITransactionalEmailSender emailSender,
        IOptions<AuthAppSettings> authOptions,
        CancellationToken cancellationToken)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        if (!TryValidate(request, out var validationError))
        {
            return Results.BadRequest(new { message = validationError });
        }

        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            return Results.BadRequest(new { message = "An account with this email already exists." });
        }

        var user = new SpennyUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            DisplayName = request.DisplayName.Trim(),
            AuthProvider = AuthProviderKind.Local,
            EmailConfirmed = false,
        };

        var create = await userManager.CreateAsync(user, request.Password);
        if (!create.Succeeded)
        {
            var message = create.Errors.FirstOrDefault()?.Description ?? "Registration failed.";
            return Results.BadRequest(new { message });
        }

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var link = BuildSpaLink(
            authOptions.Value.SpaBaseUrl,
            "/verify-email",
            new Dictionary<string, string?>
            {
                ["userId"] = user.Id,
                ["token"] = token,
            });

        await emailSender.SendEmailConfirmationAsync(user, link, cancellationToken);

        return Results.Ok(new
        {
            requiresEmailVerification = true,
            message = "Check your email to verify your account before signing in.",
        });
    }

    private static async Task<IResult> LoginAsync(
        [FromBody] LoginRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager,
        SignInManager<SpennyUser> signInManager,
        SpennyDbContext db,
        CancellationToken cancellationToken)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { message = "Email and password are required." });
        }

        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Results.Json(
                new { code = "invalid_credentials", message = "Email or password is incorrect." },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        if (!user.EmailConfirmed)
        {
            return Results.Json(
                new
                {
                    code = "email_not_verified",
                    message = "Verify your email before signing in. Check your inbox or resend the verification message.",
                },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        await signInManager.SignInAsync(user, isPersistent: true);
        await RecordLoginAsync(db, user.Id, cancellationToken);

        return Results.Ok(ToSessionDto(user));
    }

    private static async Task<IResult> LogoutAsync(SignInManager<SpennyUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return Results.Ok();
    }

    private static async Task<IResult> GetSessionAsync(
        HttpContext http,
        UserManager<SpennyUser> userManager)
    {
        if (!http.RequestServices.IsAuthConfigured())
        {
            return Results.Ok(new { authenticated = false });
        }

        var user = await userManager.GetUserAsync(http.User);
        if (user is null)
        {
            return Results.Ok(new { authenticated = false });
        }

        return Results.Ok(new
        {
            authenticated = true,
            user = ToSessionDto(user),
            domainAccess = user.AuthProvider == AuthProviderKind.Google || user.EmailConfirmed,
        });
    }

    private static async Task<IResult> ResendVerificationAsync(
        [FromBody] ResendVerificationRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager,
        ITransactionalEmailSender emailSender,
        IOptions<AuthAppSettings> authOptions,
        CancellationToken cancellationToken)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(new { message = "Email is required." });
        }

        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is not null && !user.EmailConfirmed)
        {
            var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var link = BuildSpaLink(
                authOptions.Value.SpaBaseUrl,
                "/verify-email",
                new Dictionary<string, string?>
                {
                    ["userId"] = user.Id,
                    ["token"] = token,
                });
            await emailSender.SendEmailConfirmationAsync(user, link, cancellationToken);
        }

        return Results.Ok(new
        {
            message = "If an unverified account exists for that email, a new verification message was sent.",
        });
    }

    private static async Task<IResult> ConfirmEmailAsync(
        [FromBody] ConfirmEmailRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Token))
        {
            return Results.BadRequest(new { message = "Invalid verification link." });
        }

        var user = await userManager.FindByIdAsync(request.UserId);
        if (user is null)
        {
            return Results.BadRequest(new { message = "Invalid verification link." });
        }

        var result = await userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
        {
            return Results.BadRequest(new { message = "Verification link is invalid or has expired." });
        }

        return Results.Ok(new { message = "Email verified. You can sign in now." });
    }

    private static async Task<IResult> ForgotPasswordAsync(
        [FromBody] ForgotPasswordRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager,
        ITransactionalEmailSender emailSender,
        IOptions<AuthAppSettings> authOptions,
        CancellationToken cancellationToken)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(new { message = "Email is required." });
        }

        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is not null && user.AuthProvider == AuthProviderKind.Local)
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var link = BuildSpaLink(
                authOptions.Value.SpaBaseUrl,
                "/reset-password",
                new Dictionary<string, string?>
                {
                    ["userId"] = user.Id,
                    ["token"] = token,
                });
            await emailSender.SendPasswordResetAsync(user, link, cancellationToken);
        }

        return Results.Ok(new
        {
            message = "If an account exists for that email, password reset instructions were sent.",
        });
    }

    private static async Task<IResult> ResetPasswordAsync(
        [FromBody] ResetPasswordRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        if (string.IsNullOrWhiteSpace(request.UserId)
            || string.IsNullOrWhiteSpace(request.Token)
            || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return Results.BadRequest(new { message = "Invalid reset request." });
        }

        if (request.NewPassword.Length < 8)
        {
            return Results.BadRequest(new { message = "Password must be at least 8 characters." });
        }

        var user = await userManager.FindByIdAsync(request.UserId);
        if (user is null)
        {
            return Results.BadRequest(new { message = "Invalid reset link." });
        }

        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            var message = result.Errors.FirstOrDefault()?.Description ?? "Password reset failed.";
            return Results.BadRequest(new { message });
        }

        return Results.Ok(new { message = "Password updated. You can sign in now." });
    }

    private static async Task RecordLoginAsync(SpennyDbContext db, string userId, CancellationToken cancellationToken)
    {
        db.LoginAuditEvents.Add(new LoginAuditEvent
        {
            UserId = userId,
            OccurredAtUtc = DateTimeOffset.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    private static SessionUserDto ToSessionDto(SpennyUser user) => new(
        user.Id,
        user.Email ?? string.Empty,
        user.DisplayName,
        user.EmailConfirmed,
        user.AuthProvider.ToString(),
        user.IsAdmin);

    private static string BuildSpaLink(string spaBaseUrl, string path, IReadOnlyDictionary<string, string?> query)
    {
        var baseUri = spaBaseUrl.TrimEnd('/');
        var encoded = query
            .Where(pair => pair.Value is not null)
            .Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value!)}");
        var qs = string.Join('&', encoded);
        return $"{baseUri}{path}?{qs}";
    }

    private static bool TryValidate(RegisterRequest request, out string error)
    {
        var context = new ValidationContext(request);
        var results = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, context, results, validateAllProperties: true))
        {
            error = results[0].ErrorMessage ?? "Invalid registration.";
            return false;
        }

        error = string.Empty;
        return true;
    }

    public sealed record RegisterRequest(
        [Required][EmailAddress] string Email,
        [Required][MinLength(8)] string Password,
        [Required][MinLength(1)][MaxLength(100)] string DisplayName);

    public sealed record LoginRequest(string Email, string Password);

    public sealed record ResendVerificationRequest(string Email);

    public sealed record ConfirmEmailRequest(string UserId, string Token);

    public sealed record ForgotPasswordRequest(string Email);

    public sealed record ResetPasswordRequest(string UserId, string Token, string NewPassword);

    public sealed record SessionUserDto(
        string Id,
        string Email,
        string DisplayName,
        bool EmailConfirmed,
        string AuthProvider,
        bool IsAdmin);
}
