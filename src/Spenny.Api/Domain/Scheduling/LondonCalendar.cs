// Calendar "today" in Europe/London for month projection and API responses.
namespace Spenny.Api.Domain.Scheduling;

public static class LondonCalendar
{
    public static DateOnly TodayInLondon(TimeProvider timeProvider)
    {
        var instant = timeProvider.GetUtcNow();
        var london = TimeZoneInfo.ConvertTimeFromUtc(instant.UtcDateTime, SpennyTimeZones.London);
        return DateOnly.FromDateTime(london);
    }
}
