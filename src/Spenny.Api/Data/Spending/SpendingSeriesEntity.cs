// Persisted Spending series template; occurrences are derived at read time via month projection.
using Spenny.Api.Auth.Identity;
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Data.Spending;

public sealed class SpendingSeriesEntity
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public SpennyUser? User { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateOnly AnchorDate { get; set; }

    public SpendingFrequency Frequency { get; set; }

    public SpendingCategory Category { get; set; }

    public bool RoundWeekendToFriday { get; set; }

    public string? Description { get; set; }
}
