// Integration tests for admin aggregate stats: authorization and metric correctness.
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Data;
using Spenny.Api.Data.Spending;
using Spenny.Api.Domain.Spending;
using Spenny.Api.Tests.Support;

namespace Spenny.Api.Tests.Admin;

public class AdminEndpointsTests
{
    private static readonly DateTimeOffset FixedUtc =
        new(2026, 10, 10, 11, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task GetStats_Unauthenticated_Returns401()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/admin/stats");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetStats_NonAdmin_Returns403()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "not-admin@example.com", "User");

        var response = await client.GetAsync("/api/admin/stats");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetStats_Admin_ReturnsAggregateCountsMatchingFixtureData()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var within24h = FixedUtc.AddHours(-2);
        var within7d = FixedUtc.AddDays(-3);
        var older = FixedUtc.AddDays(-10);

        await AuthTestHelpers.SeedUserAsync(
            factory, "recent-local@example.com", "Recent", AuthProviderKind.Local, within24h);
        await AuthTestHelpers.SeedUserAsync(
            factory, "week-local@example.com", "Week", AuthProviderKind.Local, within7d);
        await AuthTestHelpers.SeedUserAsync(
            factory, "old-google@example.com", "Old", AuthProviderKind.Google, older);

        const string adminEmail = "admin-stats@example.com";
        await AuthTestHelpers.SeedUserAsync(
            factory, adminEmail, "Admin", AuthProviderKind.Local, within24h);
        await AuthTestHelpers.MakeAdminAsync(factory, adminEmail);

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<SpennyDbContext>();
            var adminUser = await db.Users.SingleAsync(u => u.Email == adminEmail);
            var recentUser = await db.Users.SingleAsync(u => u.Email == "recent-local@example.com");
            var weekUser = await db.Users.SingleAsync(u => u.Email == "week-local@example.com");

            db.LoginAuditEvents.AddRange(
                new LoginAuditEvent { UserId = recentUser.Id, OccurredAtUtc = FixedUtc.AddHours(-1) },
                new LoginAuditEvent { UserId = recentUser.Id, OccurredAtUtc = FixedUtc.AddMinutes(-30) },
                new LoginAuditEvent { UserId = weekUser.Id, OccurredAtUtc = FixedUtc.AddHours(-5) },
                new LoginAuditEvent { UserId = adminUser.Id, OccurredAtUtc = FixedUtc.AddDays(-2) });

            db.SpendingSeries.AddRange(
                new SpendingSeriesEntity
                {
                    Id = Guid.NewGuid(),
                    UserId = recentUser.Id,
                    Name = "A",
                    Amount = 10m,
                    AnchorDate = new DateOnly(2026, 10, 1),
                    Frequency = SpendingFrequency.OneOff,
                    Category = SpendingCategory.General,
                    RoundWeekendToFriday = false,
                    CreatedAtUtc = FixedUtc,
                },
                new SpendingSeriesEntity
                {
                    Id = Guid.NewGuid(),
                    UserId = weekUser.Id,
                    Name = "B",
                    Amount = 20m,
                    AnchorDate = new DateOnly(2026, 10, 1),
                    Frequency = SpendingFrequency.OneOff,
                    Category = SpendingCategory.General,
                    RoundWeekendToFriday = false,
                    CreatedAtUtc = FixedUtc,
                });

            await db.SaveChangesAsync();
        }

        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = adminEmail,
            password = AuthTestHelpers.DefaultPassword,
        });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var statsResponse = await client.GetAsync("/api/admin/stats");
        var statsBody = await statsResponse.Content.ReadAsStringAsync();
        Assert.True(statsResponse.IsSuccessStatusCode, statsBody);
        var stats = System.Text.Json.JsonSerializer.Deserialize<AdminStatsPayload>(
            statsBody,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Assert.NotNull(stats);
        Assert.Equal(4, stats.TotalUsers);
        Assert.Equal(2, stats.SignUpsLast24Hours);
        Assert.Equal(3, stats.SignUpsLast7Days);
        Assert.Equal(3, stats.UniqueLoginsLast24Hours);
        Assert.Equal(1, stats.GoogleAccounts);
        Assert.Equal(3, stats.LocalAccounts);
        Assert.Equal(2, stats.TotalSpendingSeries);
    }

    private sealed record AdminStatsPayload(
        int TotalUsers,
        int SignUpsLast24Hours,
        int SignUpsLast7Days,
        int UniqueLoginsLast24Hours,
        int GoogleAccounts,
        int LocalAccounts,
        int TotalSpendingSeries);
}
