// Google account identity rules and domain access (no live OAuth in tests).
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Tests.Support;

namespace Spenny.Api.Tests.Auth.Endpoints;

public class GoogleAuthEndpointsTests
{
    [Fact]
    public async Task Providers_ReturnsGoogleFalse_WhenNotConfigured()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient();

        var providers = await client.GetFromJsonAsync<AuthProvidersResponse>("/api/auth/providers");
        Assert.NotNull(providers);
        Assert.False(providers.google);
    }

    [Fact]
    public async Task GoogleChallenge_SendsRedirectUriOnBrowserOrigin()
    {
        await using var factory = new AuthWebApplicationFactory(googleConfigured: true);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost:5173"),
        });

        var response = await client.GetAsync("/api/auth/google?returnUrl=/dashboard");

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        var location = response.Headers.Location?.ToString() ?? string.Empty;
        Assert.StartsWith("https://accounts.google.com/", location);
        Assert.Contains(
            "redirect_uri=" + Uri.EscapeDataString("http://localhost:5173/api/auth/google/callback"),
            location);
    }

    [Fact]
    public async Task LocalRegister_RejectedWhenGoogleAccountHasEmail()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient();

        await CreateGoogleUserAsync(factory, "shared@example.com", "google-sub-1");

        var register = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "shared@example.com",
            password = "password123",
            displayName = "Local User",
        });

        Assert.Equal(HttpStatusCode.BadRequest, register.StatusCode);
    }

    [Fact]
    public async Task LocalLogin_ReturnsUseGoogle_WhenAccountIsGoogle()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient();

        await CreateGoogleUserAsync(factory, "google-only@example.com", "google-sub-3");

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "google-only@example.com",
            password = "password123",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);
        var body = await login.Content.ReadFromJsonAsync<LoginErrorResponse>();
        Assert.Equal("use_google", body?.code);
    }

    [Fact]
    public async Task GoogleUser_WithSession_CanAccessDomainApi()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var userId = await CreateGoogleUserAsync(factory, "google-user@example.com", "google-sub-2");
        await AttachSessionCookieAsync(factory, client, userId);

        var session = await client.GetFromJsonAsync<SessionResponse>("/api/auth/session");
        Assert.True(session?.authenticated);
        Assert.True(session?.domainAccess);

        var domain = await client.GetAsync("/api/domain/access-check");
        Assert.Equal(HttpStatusCode.OK, domain.StatusCode);
    }

    private static async Task AttachSessionCookieAsync(
        AuthWebApplicationFactory factory,
        HttpClient client,
        string userId)
    {
        using var scope = factory.Services.CreateScope();
        var accessor = scope.ServiceProvider.GetRequiredService<IHttpContextAccessor>();
        var signInManager = scope.ServiceProvider.GetRequiredService<SignInManager<SpennyUser>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();

        var httpContext = new DefaultHttpContext { RequestServices = scope.ServiceProvider };
        accessor.HttpContext = httpContext;

        var user = await userManager.FindByIdAsync(userId);
        Assert.NotNull(user);
        await signInManager.SignInAsync(user, isPersistent: true);

        foreach (var setCookie in httpContext.Response.Headers.SetCookie)
        {
            if (string.IsNullOrEmpty(setCookie))
            {
                continue;
            }

            var cookiePair = setCookie.Split(';', 2)[0];
            client.DefaultRequestHeaders.Add("Cookie", cookiePair);
        }
    }

    private static async Task<string> CreateGoogleUserAsync(
        AuthWebApplicationFactory factory,
        string email,
        string providerKey)
    {
        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
        var user = new SpennyUser
        {
            UserName = $"google_{providerKey}",
            Email = email,
            DisplayName = "Google Test",
            AuthProvider = AuthProviderKind.Google,
            EmailConfirmed = true,
        };
        var result = await userManager.CreateAsync(user);
        Assert.True(result.Succeeded, string.Join("; ", result.Errors.Select(e => e.Description)));
        return user.Id;
    }

    private sealed record LoginErrorResponse(string code, string message);

    private sealed record AuthProvidersResponse(bool google);

    private sealed record SessionResponse(bool authenticated, bool domainAccess);
}
