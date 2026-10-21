// Shared auth setup for API integration tests.
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Spenny.Api.Auth.Identity;

namespace Spenny.Api.Tests.Support;

internal static class AuthTestHelpers
{
    internal const string DefaultPassword = "password123";

    internal static async Task RegisterAsync(HttpClient client, string email, string displayName)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = DefaultPassword,
            displayName,
        });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    internal static async Task ConfirmEmailAsync(AuthWebApplicationFactory factory, string email)
    {
        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var result = await userManager.ConfirmEmailAsync(user, token);
        Assert.True(result.Succeeded);
    }

    internal static async Task SignInVerifiedAsync(
        AuthWebApplicationFactory factory,
        HttpClient client,
        string email,
        string displayName)
    {
        await RegisterAsync(client, email, displayName);
        await ConfirmEmailAsync(factory, email);
        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = DefaultPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    internal static async Task MakeAdminAsync(AuthWebApplicationFactory factory, string email)
    {
        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);
        user.IsAdmin = true;
        var update = await userManager.UpdateAsync(user);
        Assert.True(update.Succeeded);
    }

    internal static async Task<SpennyUser> SeedUserAsync(
        AuthWebApplicationFactory factory,
        string email,
        string displayName,
        AuthProviderKind provider,
        DateTimeOffset registeredAtUtc,
        bool emailConfirmed = true)
    {
        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
        var user = new SpennyUser
        {
            UserName = provider == AuthProviderKind.Google ? $"google_{email}" : email,
            Email = email,
            DisplayName = displayName,
            AuthProvider = provider,
            EmailConfirmed = emailConfirmed,
            RegisteredAtUtc = registeredAtUtc,
        };

        var create = provider == AuthProviderKind.Local
            ? await userManager.CreateAsync(user, DefaultPassword)
            : await userManager.CreateAsync(user);
        Assert.True(create.Succeeded);
        return user;
    }
}
