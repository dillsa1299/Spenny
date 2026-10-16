// Projects Spending series and exceptions into month occurrences, burndown, and coming-up lists.
using Spenny.Api.Domain.Scheduling;
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Domain.Projection;

public static class SpendingMonthProjection
{
    public static SpendingMonthProjectionResult Project(
        IReadOnlyList<SpendingSeries> series,
        IReadOnlyList<SpendingException> exceptions,
        int year,
        int month,
        DateOnly asOfDate,
        TimeZoneInfo? timeZone = null)
    {
        _ = timeZone ?? SpennyTimeZones.London;

        var exceptionLookup = exceptions
            .GroupBy(e => (e.SeriesId, e.OccurrenceDate))
            .ToDictionary(g => g.Key, g => g.Last());

        var occurrences = new List<SpendingOccurrence>();

        foreach (var item in series)
        {
            foreach (var rawDate in OccurrenceExpansion.RawDatesInMonth(item, year, month))
            {
                var effective = WeekendAdjustment.Apply(rawDate, item.RoundWeekendToFriday);
                exceptionLookup.TryGetValue((item.Id, rawDate), out var exception);
                var occurrence = SpendingExceptionRules.Apply(item, rawDate, effective, exception);
                if (occurrence is not null)
                {
                    occurrences.Add(occurrence);
                }
            }
        }

        occurrences.Sort(static (a, b) =>
        {
            var byDate = a.EffectiveDate.CompareTo(b.EffectiveDate);
            if (byDate != 0)
            {
                return byDate;
            }

            var bySeries = a.SeriesId.CompareTo(b.SeriesId);
            return bySeries != 0 ? bySeries : a.OccurrenceDate.CompareTo(b.OccurrenceDate);
        });

        var monthTotal = occurrences.Sum(o => o.Amount);
        var burndownSteps = BuildBurndownSteps(occurrences, monthTotal);
        var remainingAtToday = occurrences
            .Where(o => o.EffectiveDate > asOfDate)
            .Sum(o => o.Amount);

        var selectedIndex = CalendarMonth.MonthIndex(year, month);
        var asOfIndex = CalendarMonth.MonthIndex(asOfDate.Year, asOfDate.Month);
        IReadOnlyList<OccurrenceId> upcoming = selectedIndex < asOfIndex
            ? []
            : selectedIndex == asOfIndex
                ? occurrences.Where(o => o.EffectiveDate > asOfDate).Select(o => o.Id).ToList()
                : occurrences.Select(o => o.Id).ToList();

        var showTodayMarker = selectedIndex == asOfIndex;

        return new SpendingMonthProjectionResult(
            occurrences,
            burndownSteps,
            monthTotal,
            remainingAtToday,
            upcoming,
            showTodayMarker);
    }

    private static List<BurndownStep> BuildBurndownSteps(
        IReadOnlyList<SpendingOccurrence> occurrences,
        decimal monthTotal)
    {
        var steps = new List<BurndownStep>();
        var remaining = monthTotal;

        foreach (var group in occurrences.GroupBy(o => o.EffectiveDate).OrderBy(g => g.Key))
        {
            var dayTotal = group.Sum(o => o.Amount);
            remaining -= dayTotal;
            steps.Add(new BurndownStep(group.Key, dayTotal, remaining));
        }

        return steps;
    }
}
