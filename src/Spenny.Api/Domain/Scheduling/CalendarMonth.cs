namespace Spenny.Api.Domain.Scheduling;

internal static class CalendarMonth
{
    public static DateOnly Start(int year, int month) => new(year, month, 1);

    public static DateOnly End(int year, int month) => Start(year, month).AddMonths(1).AddDays(-1);

    public static int MonthIndex(int year, int month) => year * 12 + (month - 1);

    public static int ClampDayOfMonth(int year, int month, int anchorDay)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);
        return Math.Min(anchorDay, daysInMonth);
    }
}
