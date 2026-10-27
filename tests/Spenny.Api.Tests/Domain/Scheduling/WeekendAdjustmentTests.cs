// Unit tests for UK working-day effective dating (weekends and bank holidays).
using Spenny.Api.Domain.Scheduling;

namespace Spenny.Api.Tests.Domain.Scheduling;

public class WeekendAdjustmentTests
{
    [Theory]
    [InlineData("2026-03-07", "2026-03-09")] // Saturday → Monday
    [InlineData("2026-03-08", "2026-03-09")] // Sunday → Monday
    public void Apply_WhenRoundEnabled_MovesWeekendToNextMonday(string raw, string expected)
    {
        var result = WeekendAdjustment.Apply(DateOnly.Parse(raw), roundWeekendToFriday: true);
        Assert.Equal(DateOnly.Parse(expected), result);
    }

    [Fact]
    public void Apply_WhenRoundDisabled_KeepsWeekendDates()
    {
        var saturday = new DateOnly(2026, 3, 7);
        Assert.Equal(saturday, WeekendAdjustment.Apply(saturday, roundWeekendToFriday: false));
    }

    [Fact]
    public void Apply_WhenRoundEnabled_LeavesWeekdayUnchanged()
    {
        var monday = new DateOnly(2026, 3, 9);
        Assert.Equal(monday, WeekendAdjustment.Apply(monday, roundWeekendToFriday: true));
    }

    [Fact]
    public void Apply_WhenRoundEnabled_MovesWeekdayBankHolidayToNextWorkingDay()
    {
        // Early May bank holiday (England & Wales), Monday 2026-05-04
        var result = WeekendAdjustment.Apply(new DateOnly(2026, 5, 4), roundWeekendToFriday: true);
        Assert.Equal(new DateOnly(2026, 5, 5), result);
    }

    [Fact]
    public void Apply_WhenRoundEnabled_MovesGoodFridayToNextWorkingDay()
    {
        // Good Friday 2026-04-03 → next weekday Nager.Date GB treats as working (2026-04-06).
        var result = WeekendAdjustment.Apply(new DateOnly(2026, 4, 3), roundWeekendToFriday: true);
        Assert.Equal(new DateOnly(2026, 4, 6), result);
    }

    [Fact]
    public void Apply_WhenRoundEnabled_SkipsWeekendAndMondayHolidayChain()
    {
        // Sunday before Early May Monday 2026-05-04 → Tuesday 2026-05-05
        var result = WeekendAdjustment.Apply(new DateOnly(2026, 5, 3), roundWeekendToFriday: true);
        Assert.Equal(new DateOnly(2026, 5, 5), result);
    }
}
