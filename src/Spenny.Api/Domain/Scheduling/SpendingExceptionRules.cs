// Applies per-occurrence skip and field overrides without touching recurrence expansion.
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Domain.Scheduling;

public static class SpendingExceptionRules
{
    public static SpendingOccurrence? Apply(
        SpendingSeries series,
        DateOnly occurrenceDate,
        DateOnly effectiveDate,
        SpendingException? exception)
    {
        if (exception is { IsSkipped: true })
        {
            return null;
        }

        var id = new OccurrenceId(series.Id, occurrenceDate);
        return new SpendingOccurrence(
            id,
            series.Id,
            occurrenceDate,
            effectiveDate,
            exception?.Name ?? series.Name,
            exception?.Amount ?? series.Amount,
            exception?.Category ?? series.Category,
            exception?.Description ?? series.Description);
    }
}
