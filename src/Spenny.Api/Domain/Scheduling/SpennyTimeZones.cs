// Product calendar semantics use Europe/London per functional spec.
namespace Spenny.Api.Domain.Scheduling;

public static class SpennyTimeZones
{
    public static TimeZoneInfo London { get; } = TimeZoneInfo.FindSystemTimeZoneById("Europe/London");
}
