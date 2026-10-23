// UK public holidays for working-day adjustment (Nager.Date 1.x, CountryCode.GB).
// GB includes England & Wales plus Scotland-specific days; product accepts whole-UK rounding.
// shortcut: Nager.Date 2.x needs a license key; stay on 1.29.x until we adopt a paid key or static table.
using Nager.Date;

namespace Spenny.Api.Domain.Scheduling;

public static class UkBankHolidayCalendar
{
    public static bool IsBankHoliday(DateOnly date)
    {
        return DateSystem.IsPublicHoliday(date.ToDateTime(TimeOnly.MinValue), CountryCode.GB);
    }
}
