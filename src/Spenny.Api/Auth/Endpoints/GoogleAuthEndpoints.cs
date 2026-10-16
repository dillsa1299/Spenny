// Google OAuth challenge and callback; issues the same application cookie as local sign-in.
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Spenny.Api.Auth.DependencyInjection;
using Spenny.Api.Auth.Google;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Auth.Options;
using Spenny.Api.Data;

namespace Spenny.Api.Auth.Endpoints;

public static class GoogleAuthEndpoints
{
    public static IEndpointRouteBuilder MapGoogleAuthEndpoints(this IEndpointRouteBuilder api)
    {
        var auth = api.MapGroup("/auth");

        auth.MapGet("/providers", (HttpContext http, IOptions<AuthAppSettings> authOptions) =>
        {
            var google = http.RequestServices.GetService<GoogleAuthServicesRegistered>() is not null;
            return Results.Ok(new
            {
                google,
                googleRedirectUri = google
                    ? GoogleOAuthUrls.BuildCallbackUrl(authOptions.Value.SpaBaseUrl)
                    : null,
            });
        }).AllowAnonymous();

        auth.MapGet("/google", ChallengeGoogleAsync).AllowAnonymous();
        auth.MapGet("/google/complete", GoogleCallbackAsync).AllowAnonymous();

        return api;
    }

    private static IResult GoogleNotConfigured()
    {
        return Results.Problem(
            title: "Google sign-in unavailable",
            detail: "Configure Authentication:Google client credentials to enable Google sign-in.",
            statusCode: StatusCodes.Status503ServiceUnavailable);
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

    private static IResult ChallengeGoogleAsync(
        HttpContext http,
        SignInManager<SpennyUser> signInManager,
        IOptions<AuthAppSettings> authOptions)
    {
        if (http.RequestServices.GetService<GoogleAuthServicesRegistered>() is null)
        {
            return GoogleNotConfigured();
        }

        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        var returnUrl = NormalizeReturnUrl(http.Request.Query["returnUrl"].FirstOrDefault());
        var properties = signInManager.ConfigureExternalAuthenticationProperties(
            GoogleDefaults.AuthenticationScheme,
            GoogleOAuthUrls.CompletePath);
        properties.Items["returnUrl"] = returnUrl;

        return Results.Challenge(properties, [GoogleDefaults.AuthenticationScheme]);
    }

    private static async Task<IResult> GoogleCallbackAsync(
        HttpContext http,
        SignInManager<SpennyUser> signInManager,
        UserManager<SpennyUser> userManager,
        SpennyDbContext db,
        IOptions<AuthAppSettings> authOptions,
        CancellationToken cancellationToken)
    {
        if (http.RequestServices.GetService<GoogleAuthServicesRegistered>() is null)
        {
            return GoogleNotConfigured();
        }

        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        var spaBase = authOptions.Value.SpaBaseUrl.TrimEnd('/');

        var info = await signInManager.GetExternalLoginInfoAsync();
        if (info is null)
        {
            return Results.Redirect($"{spaBase}/sign-in?google_error=external_login");
        }

        var returnUrl = "/dashboard";
        if (info.AuthenticationProperties?.Items.TryGetValue("returnUrl", out var storedReturn) == true)
        {
            returnUrl = NormalizeReturnUrl(storedReturn);
        }

        var signInResult = await signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: true);

        if (signInResult.Succeeded)
        {
            var existing = await userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (existing is not null)
            {
                await RecordLoginAsync(db, existing.Id, cancellationToken);
            }

            return Results.Redirect($"{spaBase}{returnUrl}");
        }

        if (signInResult.IsLockedOut)
        {
            return Results.Redirect($"{spaBase}/sign-in?google_error=locked_out");
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            return Results.Redirect($"{spaBase}/sign-in?google_error=no_email");
        }

        var existingByEmail = await userManager.FindByEmailAsync(email.Trim());
        if (existingByEmail is not null)
        {
            return Results.Redirect($"{spaBase}/sign-in?google_error=email_in_use");
        }

        var displayName = info.Principal.FindFirstValue(ClaimTypes.Name)
            ?? info.Principal.FindFirstValue("name")
            ?? email.Split('@')[0];

        var user = new SpennyUser
        {
            UserName = $"google_{info.ProviderKey}",
            Email = email.Trim(),
            DisplayName = displayName.Trim(),
            AuthProvider = AuthProviderKind.Google,
            EmailConfirmed = true,
        };

        var create = await userManager.CreateAsync(user);
        if (!create.Succeeded)
        {
            return Results.Redirect($"{spaBase}/sign-in?google_error=create_failed");
        }

        var addLogin = await userManager.AddLoginAsync(user, info);
        if (!addLogin.Succeeded)
        {
            await userManager.DeleteAsync(user);
            return Results.Redirect($"{spaBase}/sign-in?google_error=login_link");
        }

        await signInManager.SignInAsync(user, isPersistent: true);
        await RecordLoginAsync(db, user.Id, cancellationToken);

        return Results.Redirect($"{spaBase}{returnUrl}");
    }

    private static string NormalizeReturnUrl(string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(returnUrl))
        {
            return "/dashboard";
        }

        if (!returnUrl.StartsWith('/') || returnUrl.StartsWith("//") || returnUrl.Contains("://", StringComparison.Ordinal))
        {
            return "/dashboard";
        }

        return returnUrl;
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
}
