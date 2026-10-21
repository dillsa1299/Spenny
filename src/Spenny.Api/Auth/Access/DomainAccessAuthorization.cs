// Requires a signed-in user whose email is verified (local) or who signed in via Google.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Spenny.Api.Auth.Identity;

namespace Spenny.Api.Auth.Access;

public static class DomainAccessAuthorization
{
    public const string PolicyName = "DomainAccess";

    public static IServiceCollection AddDomainAccessAuthorization(this IServiceCollection services)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(PolicyName, policy =>
                policy.RequireAuthenticatedUser()
                    .AddRequirements(new DomainAccessRequirement()))
            .AddAdminAccessPolicy();

        services.AddScoped<IAuthorizationHandler, DomainAccessHandler>();
        services.AddScoped<IAuthorizationHandler, AdminAccessHandler>();
        return services;
    }
}

public sealed class DomainAccessRequirement : IAuthorizationRequirement;

public sealed class DomainAccessHandler(UserManager<SpennyUser> userManager)
    : AuthorizationHandler<DomainAccessRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        DomainAccessRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var user = await userManager.GetUserAsync(context.User);
        if (user is null)
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
