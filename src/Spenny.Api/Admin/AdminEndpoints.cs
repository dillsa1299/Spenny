// Aggregate site metrics for operators; no PII in responses.
using Microsoft.EntityFrameworkCore;
using Spenny.Api.Auth.Access;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Data;
using Spenny.Api.Domain.Scheduling;

namespace Spenny.Api.Admin;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder api)
    {
        var admin = api.MapGroup("/admin")
            .RequireAuthorization(AdminAccessAuthorization.PolicyName);

        admin.MapGet("/stats", GetStatsAsync);

        return api;
    }

    private static async Task<IResult> GetStatsAsync(
        SpennyDbContext db,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var window24h = LondonCalendar.RollingWindowStartUtc(timeProvider, TimeSpan.FromHours(24));
        var window7d = LondonCalendar.RollingWindowStartUtc(timeProvider, TimeSpan.FromDays(7));

        // shortcut: materialize user aggregates; fine for v1 admin volumes; switch to SQL GROUP BY if counts grow large
        var users = await db.Users
            .AsNoTracking()
            .Select(u => new { u.RegisteredAtUtc, u.AuthProvider })
            .ToListAsync(cancellationToken);

        var totalUsers = users.Count;
        var signUpsLast24Hours = users.Count(u => u.RegisteredAtUtc >= window24h);
        var signUpsLast7Days = users.Count(u => u.RegisteredAtUtc >= window7d);
        var googleAccounts = users.Count(u => u.AuthProvider == AuthProviderKind.Google);
        var localAccounts = users.Count(u => u.AuthProvider == AuthProviderKind.Local);

        var loginUserIds = await db.LoginAuditEvents
            .AsNoTracking()
            .Select(e => new { e.UserId, e.OccurredAtUtc })
            .ToListAsync(cancellationToken);
        var uniqueLoginsLast24Hours = loginUserIds
            .Where(e => e.OccurredAtUtc >= window24h)
            .Select(e => e.UserId)
            .Distinct()
            .Count();

        var totalSpendingSeries = await db.SpendingSeries.CountAsync(cancellationToken);

        return Results.Ok(new AdminStatsResponse(
            totalUsers,
            signUpsLast24Hours,
            signUpsLast7Days,
            uniqueLoginsLast24Hours,
            googleAccounts,
            localAccounts,
            totalSpendingSeries));
    }

    public sealed record AdminStatsResponse(
        int TotalUsers,
        int SignUpsLast24Hours,
        int SignUpsLast7Days,
        int UniqueLoginsLast24Hours,
        int GoogleAccounts,
        int LocalAccounts,
        int TotalSpendingSeries);
}
