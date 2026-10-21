// Admin-only routes: verified domain access plus IsAdmin flag (set via operations/DB).
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Spenny.Api.Auth.Identity;

namespace Spenny.Api.Auth.Access;

public static class AdminAccessAuthorization
{
    public const string PolicyName = "AdminAccess";

    public static AuthorizationBuilder AddAdminAccessPolicy(this AuthorizationBuilder builder)
    {
        return builder.AddPolicy(PolicyName, policy =>
            policy.RequireAuthenticatedUser()
                .AddRequirements(new AdminAccessRequirement()));
    }
}

public sealed class AdminAccessRequirement : IAuthorizationRequirement;

public sealed class AdminAccessHandler(UserManager<SpennyUser> userManager)
    : AuthorizationHandler<AdminAccessRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AdminAccessRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var user = await userManager.GetUserAsync(context.User);
        if (user is null || !user.IsAdmin)
        {
            return;
        }

        if (user.AuthProvider == AuthProviderKind.Google)
        {
            context.Succeed(requirement);
            return;
        }

        if (user.EmailConfirmed)
        {
            context.Succeed(requirement);
        }
    }
}
