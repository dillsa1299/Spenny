// Stable identifier for one projected occurrence within a month view.
namespace Spenny.Api.Domain.Spending;

public readonly record struct OccurrenceId(Guid SeriesId, DateOnly OccurrenceDate);
