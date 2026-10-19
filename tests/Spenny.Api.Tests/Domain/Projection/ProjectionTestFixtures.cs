// Shared Spending series builders for month projection tests.
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Tests.Domain.Projection;

internal static class ProjectionTestFixtures
{
    public static SpendingSeries Series(
        Guid id,
        string name,
        decimal amount,
        DateOnly anchor,
        SpendingFrequency frequency,
        bool roundWeekend = false,
        SpendingCategory category = SpendingCategory.General,
        DateTimeOffset? createdAtUtc = null) =>
        new(id, name, amount, anchor, frequency, category, roundWeekend, null, createdAtUtc ?? default);
}
