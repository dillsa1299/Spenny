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

    /// <summary>
    /// Start of a rolling window anchored at "now" in Europe/London, expressed as UTC for persistence queries.
    /// </summary>
    public static DateTimeOffset RollingWindowStartUtc(TimeProvider timeProvider, TimeSpan duration)
    {
        var nowUtc = timeProvider.GetUtcNow();
        var londonNow = TimeZoneInfo.ConvertTime(nowUtc, SpennyTimeZones.London);
        var londonStart = londonNow.Subtract(duration);
        return TimeZoneInfo.ConvertTime(londonStart, TimeZoneInfo.Utc);
    }
}
