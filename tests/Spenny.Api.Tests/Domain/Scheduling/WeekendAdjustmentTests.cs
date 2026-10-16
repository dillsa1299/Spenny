// Unit tests for Saturday/Sunday → previous Friday effective dating.
using Spenny.Api.Domain.Scheduling;

namespace Spenny.Api.Tests.Domain.Scheduling;

public class WeekendAdjustmentTests
{
    [Theory]
    [InlineData("2026-03-07", "2026-03-06")] // Saturday → Friday
    [InlineData("2026-03-08", "2026-03-06")] // Sunday → Friday
    public void Apply_WhenRoundEnabled_MovesWeekendToPreviousFriday(string raw, string expected)
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
}
