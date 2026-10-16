// Expands series recurrence into raw occurrence dates whose effective date falls in a calendar month.
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Domain.Scheduling;

public static class OccurrenceExpansion
{
    public static IEnumerable<DateOnly> RawDatesInMonth(SpendingSeries series, int year, int month)
    {
        var monthStart = CalendarMonth.Start(year, month);
        var monthEnd = CalendarMonth.End(year, month);
        var scanStart = monthStart.AddDays(-2);
        var scanEnd = monthEnd.AddDays(2);

        return series.Frequency switch
        {
            SpendingFrequency.OneOff => OneOff(series, monthStart, monthEnd),
            SpendingFrequency.Weekly => Weekly(series, scanStart, scanEnd, monthStart, monthEnd),
            SpendingFrequency.Monthly => Monthly(series, year, month, monthStart, monthEnd),
            SpendingFrequency.Yearly => Yearly(series, year, month, monthStart, monthEnd),
            _ => [],
        };
    }

    private static IEnumerable<DateOnly> OneOff(SpendingSeries series, DateOnly monthStart, DateOnly monthEnd)
    {
        var effective = WeekendAdjustment.Apply(series.AnchorDate, series.RoundWeekendToFriday);
        if (effective >= monthStart && effective <= monthEnd)
        {
            yield return series.AnchorDate;
        }
    }

    private static IEnumerable<DateOnly> Weekly(
        SpendingSeries series,
        DateOnly scanStart,
        DateOnly scanEnd,
        DateOnly monthStart,
        DateOnly monthEnd)
    {
        var anchor = series.AnchorDate;
        var raw = anchor;
        while (raw > scanStart)
        {
            raw = raw.AddDays(-7);
        }

        while (raw <= scanEnd)
        {
            if (IsOnWeeklyGrid(anchor, raw))
            {
                var effective = WeekendAdjustment.Apply(raw, series.RoundWeekendToFriday);
                if (effective >= monthStart && effective <= monthEnd)
                {
                    yield return raw;
                }
            }

            raw = raw.AddDays(7);
        }
    }

    private static IEnumerable<DateOnly> Monthly(
        SpendingSeries series,
        int year,
        int month,
        DateOnly monthStart,
        DateOnly monthEnd)
    {
        var day = CalendarMonth.ClampDayOfMonth(year, month, series.AnchorDate.Day);
        var raw = new DateOnly(year, month, day);
        var effective = WeekendAdjustment.Apply(raw, series.RoundWeekendToFriday);
        if (effective >= monthStart && effective <= monthEnd)
        {
            yield return raw;
        }
    }

    private static IEnumerable<DateOnly> Yearly(
        SpendingSeries series,
        int year,
        int month,
        DateOnly monthStart,
        DateOnly monthEnd)
    {
        if (series.AnchorDate.Month != month)
        {
            yield break;
        }

        var day = CalendarMonth.ClampDayOfMonth(year, month, series.AnchorDate.Day);
        var raw = new DateOnly(year, month, day);
        var effective = WeekendAdjustment.Apply(raw, series.RoundWeekendToFriday);
        if (effective >= monthStart && effective <= monthEnd)
        {
            yield return raw;
        }
    }

    private static bool IsOnWeeklyGrid(DateOnly anchor, DateOnly candidate)
    {
        var delta = candidate.DayNumber - anchor.DayNumber;
        return delta % 7 == 0;
    }
}
