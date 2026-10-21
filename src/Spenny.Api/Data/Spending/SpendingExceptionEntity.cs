// Per-occurrence skip or field overrides for a recurring series; keyed by raw expansion date.
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Data.Spending;

public sealed class SpendingExceptionEntity
{
    public Guid SeriesId { get; set; }

    public SpendingSeriesEntity? Series { get; set; }

    public DateOnly OccurrenceDate { get; set; }

    public bool IsSkipped { get; set; }

    public string? Name { get; set; }

    public decimal? Amount { get; set; }

    public SpendingCategory? Category { get; set; }

    public string? Description { get; set; }
}
