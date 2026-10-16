namespace Spenny.Api.Domain.Spending;

/// <summary>
/// Per-occurrence override for a recurring series. Matched by <see cref="OccurrenceDate"/> —
/// the raw scheduled date from recurrence expansion, before weekend adjustment.
/// </summary>
public sealed record SpendingException(
    Guid SeriesId,
    DateOnly OccurrenceDate,
    bool IsSkipped = false,
    string? Name = null,
    decimal? Amount = null,
    SpendingCategory? Category = null,
    string? Description = null);
