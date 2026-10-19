// Integration tests for profile update, password change, and account deletion.
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Data;
using Spenny.Api.Domain.Spending;
using Spenny.Api.Tests.Support;

namespace Spenny.Api.Tests.Auth.Endpoints;

public class ProfileEndpointsTests
{
    private static readonly DateTimeOffset FixedUtc =
        new(2026, 10, 10, 11, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task UpdateProfile_ChangesDisplayName_InSession()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "profile@example.com", "Before");

        var patch = await client.PatchAsJsonAsync("/api/auth/profile", new { displayName = "After Name" });
        Assert.Equal(HttpStatusCode.OK, patch.StatusCode);
        var updated = await patch.Content.ReadFromJsonAsync<SessionUserResponse>();
        Assert.Equal("After Name", updated?.displayName);

        var session = await client.GetFromJsonAsync<FullSessionResponse>("/api/auth/session");
        Assert.Equal("After Name", session?.user?.displayName);
    }

    [Fact]
    public async Task ChangePassword_RejectsWrongCurrentPassword()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "pw@example.com", "User");

        var change = await client.PostAsJsonAsync("/api/auth/change-password", new
        {
            currentPassword = "wrong",
            newPassword = "newpassword99",
        });
        Assert.Equal(HttpStatusCode.BadRequest, change.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_Succeeds_AndLoginUsesNewPassword()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        const string email = "changepw@example.com";
        await AuthTestHelpers.SignInVerifiedAsync(factory, client, email, "User");

        const string newPassword = "newpassword99";
        var change = await client.PostAsJsonAsync("/api/auth/change-password", new
        {
            currentPassword = AuthTestHelpers.DefaultPassword,
            newPassword,
        });
        Assert.Equal(HttpStatusCode.OK, change.StatusCode);

        await client.PostAsync("/api/auth/logout", null);

        var login = await client.PostAsJsonAsync("/api/auth/login", new { email, password = newPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_RejectedForGoogleAccount()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var userId = await CreateGoogleUserAsync(factory, "google-pw@example.com", "google-sub-pw");
        await AttachSessionCookieAsync(factory, client, userId);

        var change = await client.PostAsJsonAsync("/api/auth/change-password", new
        {
            currentPassword = "any",
            newPassword = "newpassword99",
        });
        Assert.Equal(HttpStatusCode.BadRequest, change.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_ThenDeleteAccount_StillAuthenticated()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        const string email = "pw-then-delete@example.com";
        await AuthTestHelpers.SignInVerifiedAsync(factory, client, email, "User");

        const string newPassword = "newpassword99";
        var change = await client.PostAsJsonAsync("/api/auth/change-password", new
        {
            currentPassword = AuthTestHelpers.DefaultPassword,
            newPassword,
        });
        Assert.Equal(HttpStatusCode.OK, change.StatusCode);

        var delete = await SendDeleteAccountAsync(client, "DELETE");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
    }

    [Fact]
    public async Task DeleteAccount_RejectsWrongConfirmation()
    {
        await using var factory = new AuthWebApplicationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "nodelete@example.com", "User");

        var delete = await SendDeleteAccountAsync(client, "NOPE");
        Assert.Equal(HttpStatusCode.BadRequest, delete.StatusCode);
    }

    [Fact]
    public async Task DeleteAccount_RemovesUserSpendingAndAudit()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        const string email = "gone@example.com";
        await AuthTestHelpers.SignInVerifiedAsync(factory, client, email, "Gone User");

        string userId;
        using (var scope = factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
            var user = await userManager.FindByEmailAsync(email);
            Assert.NotNull(user);
            userId = user.Id;
        }

        var create = await client.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Rent",
            amount = 100m,
            anchorDate = "2026-10-01",
            frequency = SpendingFrequency.Monthly,
            category = SpendingCategory.General,
            roundWeekendToFriday = false,
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var delete = await SendDeleteAccountAsync(client, "DELETE");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var session = await client.GetFromJsonAsync<FullSessionResponse>("/api/auth/session");
        Assert.False(session?.authenticated);

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = AuthTestHelpers.DefaultPassword,
        });
        Assert.Equal(HttpStatusCode.Unauthorized, login.StatusCode);

        using var verifyScope = factory.Services.CreateScope();
        var db = verifyScope.ServiceProvider.GetRequiredService<SpennyDbContext>();
        var userManagerVerify = verifyScope.ServiceProvider.GetRequiredService<UserManager<SpennyUser>>();
        Assert.Null(await userManagerVerify.FindByIdAsync(userId));
        Assert.Equal(0, db.SpendingSeries.Count(s => s.UserId == userId));
        Assert.Equal(0, db.LoginAuditEvents.Count(e => e.UserId == userId));
    }

    private static Task<HttpResponseMessage> SendDeleteAccountAsync(HttpClient client, string confirmation) =>
        client.PostAsJsonAsync("/api/auth/account/delete", new { confirmation });

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

    private sealed record SessionUserResponse(string displayName);

    private sealed record FullSessionResponse(bool authenticated, SessionUserBody? user);

    private sealed record SessionUserBody(string displayName);
}
