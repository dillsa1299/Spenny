// Sums projected spending amounts whose effective dates fall after asOf through an inclusive target date.
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Domain.Projection;

public static class AmountRequiredBy
{
    /// <summary>
    /// Sums occurrence amounts with EffectiveDate strictly after <paramref name="asOfDate"/>
    /// and on or before <paramref name="targetDate"/> (all categories). Caller must ensure
    /// <paramref name="targetDate"/> is after <paramref name="asOfDate"/>.
    /// </summary>
    public static decimal Sum(
        IReadOnlyList<SpendingSeries> series,
        IReadOnlyList<SpendingException> exceptions,
        DateOnly asOfDate,
        DateOnly targetDate)
    {
        decimal total = 0;
        var cursor = new DateOnly(asOfDate.Year, asOfDate.Month, 1);
        var lastMonth = new DateOnly(targetDate.Year, targetDate.Month, 1);

        while (cursor <= lastMonth)
        {
            var projection = SpendingMonthProjection.Project(
                series,
                exceptions,
                cursor.Year,
                cursor.Month,
                asOfDate);

            total += projection.Occurrences
                .Where(o => o.EffectiveDate > asOfDate && o.EffectiveDate <= targetDate)
                .Sum(o => o.Amount);

            cursor = cursor.AddMonths(1);
        }

        return total;
    }
}
