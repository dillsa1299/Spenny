// Integration tests for local account register, verification, sign-in, and domain API gating.
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Data;
using Spenny.Api.Tests.Support;

namespace Spenny.Api.Tests.Auth.Endpoints;

public class AuthEndpointsTests
{
    private const string Password = "password123";

    [Fact]
    public async Task UnverifiedUser_CannotAccessDomainApi()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await RegisterAsync(client, "unverified@example.com", "Test User");

        var domain = await client.GetAsync("/api/domain/access-check");
        Assert.Equal(HttpStatusCode.Unauthorized, domain.StatusCode);
    }

    [Fact]
    public async Task UnverifiedLogin_ReturnsEmailNotVerified_WithoutSession()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await RegisterAsync(client, "login-block@example.com", "Blocked");

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "login-block@example.com",
            password = Password,
        });

        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
        var body = await login.Content.ReadFromJsonAsync<LoginErrorResponse>();
        Assert.Equal("email_not_verified", body?.code);

        var session = await client.GetFromJsonAsync<SessionResponse>("/api/auth/session");
        Assert.False(session?.authenticated);
    }

    [Fact]
    public async Task VerifiedUser_CanSignInAndAccessDomainApi()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        const string email = "verified@example.com";
        await RegisterAsync(client, email, "Verified User");
        await ConfirmEmailAsync(factory, email);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var session = await client.GetFromJsonAsync<SessionResponse>("/api/auth/session");
        Assert.True(session?.authenticated);
        Assert.True(session?.domainAccess);

        var domain = await client.GetAsync("/api/domain/access-check");
        Assert.Equal(HttpStatusCode.OK, domain.StatusCode);
    }

    [Fact]
    public async Task SuccessfulLogin_RecordsLoginAuditEvent()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        const string email = "audit@example.com";
        await RegisterAsync(client, email, "Audit User");
        await ConfirmEmailAsync(factory, email);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = Password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SpennyDbContext>();
        Assert.Equal(1, db.LoginAuditEvents.Count());
    }

    [Fact]
    public async Task Register_RejectsPasswordShorterThanEightCharacters()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "short@example.com",
            password = "short",
            displayName = "Short",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_WorksAfterForgotPasswordFlow()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        const string email = "reset@example.com";
        await RegisterAsync(client, email, "Reset User");
        await ConfirmEmailAsync(factory, email);

        var forgot = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email });
        Assert.Equal(HttpStatusCode.OK, forgot.StatusCode);

        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);
        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        const string newPassword = "newpassword99";
        var reset = await client.PostAsJsonAsync("/api/auth/reset-password", new
        {
            userId = user.Id,
            token,
            newPassword,
        });
        Assert.Equal(HttpStatusCode.OK, reset.StatusCode);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = newPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    private static async Task RegisterAsync(HttpClient client, string email, string displayName)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password = Password,
            displayName,
        });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static async Task ConfirmEmailAsync(AuthWebApplicationFactory factory, string email)
    {
        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var result = await userManager.ConfirmEmailAsync(user, token);
        Assert.True(result.Succeeded);
    }

    private sealed record LoginErrorResponse(string code, string message);

    private sealed record SessionResponse(bool authenticated, bool domainAccess);
}
