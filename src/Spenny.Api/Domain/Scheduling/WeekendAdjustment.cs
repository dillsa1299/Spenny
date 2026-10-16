// Maps weekend scheduled dates to the previous Friday when the series flag is enabled.
namespace Spenny.Api.Domain.Scheduling;

public static class WeekendAdjustment
{
    public static DateOnly Apply(DateOnly scheduledDate, bool roundWeekendToFriday)
    {
        if (!roundWeekendToFriday)
        {
            return scheduledDate;
        }

        return scheduledDate.DayOfWeek switch
        {
            DayOfWeek.Saturday => scheduledDate.AddDays(-1),
            DayOfWeek.Sunday => scheduledDate.AddDays(-2),
            _ => scheduledDate,
        };
    }
}
