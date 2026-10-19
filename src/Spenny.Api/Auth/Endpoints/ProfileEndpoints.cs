// Authenticated profile routes: display name, local password change, and account deletion.
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spenny.Api.Auth.Access;
using Spenny.Api.Auth.DependencyInjection;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Data;

namespace Spenny.Api.Auth.Endpoints;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapSpennyProfileEndpoints(this IEndpointRouteBuilder api)
    {
        var auth = api.MapGroup("/auth");
        var policy = DomainAccessAuthorization.PolicyName;

        auth.MapPatch("/profile", UpdateProfileAsync).RequireAuthorization(policy);
        auth.MapPost("/change-password", ChangePasswordAsync).RequireAuthorization(policy);
        // POST (not DELETE) so JSON body and cookies survive dev proxies reliably.
        auth.MapPost("/account/delete", DeleteAccountAsync).RequireAuthorization(policy);

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

    private static async Task<IResult> UpdateProfileAsync(
        [FromBody] UpdateProfileRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        var user = await userManager.GetUserAsync(http.User);
        if (user is null)
        {
            return Results.Unauthorized();
        }

        if (!TryValidateDisplayName(request.DisplayName, out var displayName, out var error))
        {
            return Results.BadRequest(new { message = error });
        }

        user.DisplayName = displayName;
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var message = result.Errors.FirstOrDefault()?.Description ?? "Profile update failed.";
            return Results.BadRequest(new { message });
        }

        return Results.Ok(SessionUserDto.FromUser(user));
    }

    private static async Task<IResult> ChangePasswordAsync(
        [FromBody] ChangePasswordRequest request,
        HttpContext http,
        UserManager<SpennyUser> userManager,
        SignInManager<SpennyUser> signInManager)
    {
        var unavailable = DatabaseUnavailable(http);
        if (unavailable is not null)
        {
            return unavailable;
        }

        var user = await userManager.GetUserAsync(http.User);
        if (user is null)
        {
            return Results.Unauthorized();
        }

        if (user.AuthProvider != AuthProviderKind.Local)
        {
            return Results.BadRequest(new { message = "Password change is only available for local accounts." });
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return Results.BadRequest(new { message = "Current and new password are required." });
        }

        if (request.NewPassword.Length < 8)
        {
            return Results.BadRequest(new { message = "Password must be at least 8 characters." });
        }

        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var message = result.Errors.FirstOrDefault()?.Description ?? "Password change failed.";
            return Results.BadRequest(new { message });
        }

        await signInManager.RefreshSignInAsync(user);
        return Results.Ok(new { message = "Password updated." });
    }

    private static async Task<IResult> DeleteAccountAsync(
        [FromBody] DeleteAccountRequest request,
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

        var user = await userManager.GetUserAsync(http.User);
        if (user is null)
        {
            return Results.Unauthorized();
        }

        if (request is null || request.Confirmation != "DELETE")
        {
            return Results.BadRequest(new { message = "Type DELETE to confirm account deletion." });
        }

        var userId = user.Id;
        await db.LoginAuditEvents
            .Where(e => e.UserId == userId)
            .ExecuteDeleteAsync(cancellationToken);

        var delete = await userManager.DeleteAsync(user);
        if (!delete.Succeeded)
        {
            var message = delete.Errors.FirstOrDefault()?.Description ?? "Account deletion failed.";
            return Results.BadRequest(new { message });
        }

        await signInManager.SignOutAsync();
        return Results.NoContent();
    }

    private static bool TryValidateDisplayName(string? raw, out string displayName, out string error)
    {
        displayName = string.Empty;
        error = string.Empty;
        if (string.IsNullOrWhiteSpace(raw))
        {
            error = "Display name is required.";
            return false;
        }

        displayName = raw.Trim();
        if (displayName.Length > 100)
        {
            error = "Display name must be 100 characters or fewer.";
            return false;
        }

        return true;
    }

    public sealed record UpdateProfileRequest([Required][MinLength(1)][MaxLength(100)] string DisplayName);

    public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    public sealed record DeleteAccountRequest(string Confirmation);
}
