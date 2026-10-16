namespace Spenny.Api.Domain.Spending;

public sealed record SpendingOccurrence(
    OccurrenceId Id,
    Guid SeriesId,
    DateOnly OccurrenceDate,
    DateOnly EffectiveDate,
    string Name,
    decimal Amount,
    SpendingCategory Category,
    string? Description);
