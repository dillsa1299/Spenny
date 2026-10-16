// Template for a Spending item (one-off or recurring); occurrences are derived at read time.
namespace Spenny.Api.Domain.Spending;

public sealed record SpendingSeries(
    Guid Id,
    string Name,
    decimal Amount,
    DateOnly AnchorDate,
    SpendingFrequency Frequency,
    SpendingCategory Category,
    bool RoundWeekendToFriday,
    string? Description = null);
