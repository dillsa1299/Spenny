// When enabled, walks forward to the next weekday that is not a UK bank holiday.
// API/DB flag remains RoundWeekendToFriday (historical name); for spending it means next UK working day.
namespace Spenny.Api.Domain.Scheduling;

public static class WeekendAdjustment
{
    public static DateOnly Apply(DateOnly scheduledDate, bool roundWeekendToFriday)
    {
        if (!roundWeekendToFriday)
        {
            return scheduledDate;
        }

        var date = scheduledDate;
        while (!IsUkWorkingDay(date))
        {
            date = date.AddDays(1);
        }

        return date;
    }

    private static bool IsUkWorkingDay(DateOnly date)
    {
        return date.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday)
            && !UkBankHolidayCalendar.IsBankHoliday(date);
    }
}
