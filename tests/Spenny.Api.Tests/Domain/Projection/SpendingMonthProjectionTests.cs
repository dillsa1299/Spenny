// Month projection: occurrences, burndown, coming-up, and today-marker rules.
using Spenny.Api.Domain.Projection;
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Tests.Domain.Projection;

public class SpendingMonthProjectionTests
{
    private static readonly Guid SeriesA = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid SeriesB = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid SeriesC = Guid.Parse("33333333-3333-3333-3333-333333333333");

    [Fact]
    public void Project_OneOff_IncludesOnlyWhenEffectiveInMonth()
    {
        var inMonth = ProjectionTestFixtures.Series(
            SeriesA,
            "Gym",
            30m,
            new DateOnly(2026, 10, 15),
            SpendingFrequency.OneOff);
        var outOfMonth = ProjectionTestFixtures.Series(
            SeriesB,
            "Other",
            10m,
            new DateOnly(2026, 11, 1),
            SpendingFrequency.OneOff);

        var result = SpendingMonthProjection.Project(
            [inMonth, outOfMonth],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 10));

        Assert.Single(result.Occurrences);
        Assert.Equal(30m, result.MonthTotal);
        Assert.Equal(new DateOnly(2026, 10, 15), result.Occurrences[0].EffectiveDate);
    }

    [Fact]
    public void Project_Weekly_ExpandsMultipleHitsInMonth()
    {
        var weekly = ProjectionTestFixtures.Series(
            SeriesA,
            "Cleaner",
            40m,
            new DateOnly(2026, 10, 3),
            SpendingFrequency.Weekly);

        var result = SpendingMonthProjection.Project(
            [weekly],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 1));

        Assert.Equal(5, result.Occurrences.Count);
        Assert.Equal(200m, result.MonthTotal);
    }

    [Fact]
    public void Project_Monthly_Jan31Anchor_ClampsToFebruaryLastDay()
    {
        var monthly = ProjectionTestFixtures.Series(
            SeriesA,
            "Mortgage",
            1000m,
            new DateOnly(2026, 1, 31),
            SpendingFrequency.Monthly);

        var result = SpendingMonthProjection.Project(
            [monthly],
            [],
            2026,
            2,
            new DateOnly(2026, 2, 1));

        Assert.Single(result.Occurrences);
        Assert.Equal(new DateOnly(2026, 2, 28), result.Occurrences[0].OccurrenceDate);
        Assert.Equal(new DateOnly(2026, 2, 28), result.Occurrences[0].EffectiveDate);
    }

    [Fact]
    public void Project_Yearly_OnlyWhenAnchorMonthMatches()
    {
        var yearly = ProjectionTestFixtures.Series(
            SeriesA,
            "Insurance",
            120m,
            new DateOnly(2020, 10, 5),
            SpendingFrequency.Yearly);

        var inOctober = SpendingMonthProjection.Project(
            [yearly],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 1));
        var inNovember = SpendingMonthProjection.Project(
            [yearly],
            [],
            2026,
            11,
            new DateOnly(2026, 11, 1));

        Assert.Single(inOctober.Occurrences);
        Assert.Equal(new DateOnly(2026, 10, 5), inOctober.Occurrences[0].EffectiveDate);
        Assert.Empty(inNovember.Occurrences);
    }

    [Fact]
    public void Project_WeekendRounding_ShiftsSaturdayToPreviousFriday()
    {
        var saturdayBill = ProjectionTestFixtures.Series(
            SeriesA,
            "Club",
            25m,
            new DateOnly(2026, 10, 3),
            SpendingFrequency.OneOff,
            roundWeekend: true);

        var result = SpendingMonthProjection.Project(
            [saturdayBill],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 1));

        Assert.Single(result.Occurrences);
        Assert.Equal(new DateOnly(2026, 10, 2), result.Occurrences[0].EffectiveDate);
    }

    [Fact]
    public void Project_SkipException_RemovesOccurrenceFromMonth()
    {
        var monthly = ProjectionTestFixtures.Series(
            SeriesA,
            "Rent",
            500m,
            new DateOnly(2026, 1, 1),
            SpendingFrequency.Monthly);
        var exception = new SpendingException(SeriesA, new DateOnly(2026, 10, 1), IsSkipped: true);

        var result = SpendingMonthProjection.Project(
            [monthly],
            [exception],
            2026,
            10,
            new DateOnly(2026, 10, 5));

        Assert.Empty(result.Occurrences);
        Assert.Equal(0m, result.MonthTotal);
    }

    [Fact]
    public void Project_EditException_ChangesBurndownTotal()
    {
        var monthly = ProjectionTestFixtures.Series(
            SeriesA,
            "Rent",
            500m,
            new DateOnly(2026, 1, 1),
            SpendingFrequency.Monthly);
        var exception = new SpendingException(
            SeriesA,
            new DateOnly(2026, 10, 1),
            Amount: 400m);

        var result = SpendingMonthProjection.Project(
            [monthly],
            [exception],
            2026,
            10,
            new DateOnly(2026, 10, 5));

        Assert.Equal(400m, result.MonthTotal);
        Assert.Equal(400m, result.Occurrences[0].Amount);
    }

    [Fact]
    public void Project_EmptyMonth_ReturnsZeroTotalsAndNoSteps()
    {
        var result = SpendingMonthProjection.Project([], [], 2026, 10, new DateOnly(2026, 10, 15));

        Assert.Empty(result.Occurrences);
        Assert.Empty(result.BurndownSteps);
        Assert.Equal(0m, result.MonthTotal);
        Assert.Equal(0m, result.RemainingAtToday);
        Assert.Empty(result.UpcomingOccurrenceIds);
    }

    [Fact]
    public void Project_Burndown_StepsDownOnEachEffectiveDate()
    {
        var a = ProjectionTestFixtures.Series(
            SeriesA,
            "A",
            100m,
            new DateOnly(2026, 10, 5),
            SpendingFrequency.OneOff);
        var b = ProjectionTestFixtures.Series(
            SeriesB,
            "B",
            50m,
            new DateOnly(2026, 10, 5),
            SpendingFrequency.OneOff);
        var c = ProjectionTestFixtures.Series(
            SeriesC,
            "C",
            25m,
            new DateOnly(2026, 10, 20),
            SpendingFrequency.OneOff);

        var result = SpendingMonthProjection.Project(
            [a, b, c],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 10));

        Assert.Equal(175m, result.MonthTotal);
        Assert.Equal(2, result.BurndownSteps.Count);

        Assert.Equal(new DateOnly(2026, 10, 5), result.BurndownSteps[0].EffectiveDate);
        Assert.Equal(150m, result.BurndownSteps[0].DayTotal);
        Assert.Equal(25m, result.BurndownSteps[0].RemainingAfter);

        Assert.Equal(new DateOnly(2026, 10, 20), result.BurndownSteps[1].EffectiveDate);
        Assert.Equal(25m, result.BurndownSteps[1].DayTotal);
        Assert.Equal(0m, result.BurndownSteps[1].RemainingAfter);
    }

    [Fact]
    public void Project_RemainingAtToday_SumsOccurrencesStrictlyAfterAsOf()
    {
        var early = ProjectionTestFixtures.Series(
            SeriesA,
            "Early",
            100m,
            new DateOnly(2026, 10, 5),
            SpendingFrequency.OneOff);
        var onDay = ProjectionTestFixtures.Series(
            SeriesB,
            "OnDay",
            50m,
            new DateOnly(2026, 10, 10),
            SpendingFrequency.OneOff);
        var later = ProjectionTestFixtures.Series(
            SeriesC,
            "Later",
            25m,
            new DateOnly(2026, 10, 20),
            SpendingFrequency.OneOff);

        var result = SpendingMonthProjection.Project(
            [early, onDay, later],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 10));

        Assert.Equal(25m, result.RemainingAtToday);
    }

    [Fact]
    public void Project_ComingUp_CurrentMonth_OnlyStrictlyAfterToday()
    {
        var past = ProjectionTestFixtures.Series(
            SeriesA,
            "Past",
            10m,
            new DateOnly(2026, 10, 5),
            SpendingFrequency.OneOff);
        var today = ProjectionTestFixtures.Series(
            SeriesB,
            "Today",
            20m,
            new DateOnly(2026, 10, 10),
            SpendingFrequency.OneOff);
        var future = ProjectionTestFixtures.Series(
            SeriesC,
            "Future",
            30m,
            new DateOnly(2026, 10, 20),
            SpendingFrequency.OneOff);

        var result = SpendingMonthProjection.Project(
            [past, today, future],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 10));

        Assert.Single(result.UpcomingOccurrenceIds);
        Assert.Equal(new OccurrenceId(SeriesC, new DateOnly(2026, 10, 20)), result.UpcomingOccurrenceIds[0]);
    }

    [Fact]
    public void Project_ComingUp_PastMonth_IsEmpty()
    {
        var bill = ProjectionTestFixtures.Series(
            SeriesA,
            "Bill",
            40m,
            new DateOnly(2026, 9, 15),
            SpendingFrequency.OneOff);

        var result = SpendingMonthProjection.Project(
            [bill],
            [],
            2026,
            9,
            new DateOnly(2026, 10, 10));

        Assert.Empty(result.UpcomingOccurrenceIds);
        Assert.False(result.ShowTodayMarker);
    }

    [Fact]
    public void Project_ComingUp_FutureMonth_IncludesAllOccurrences()
    {
        var bill = ProjectionTestFixtures.Series(
            SeriesA,
            "Bill",
            40m,
            new DateOnly(2026, 11, 15),
            SpendingFrequency.OneOff);

        var result = SpendingMonthProjection.Project(
            [bill],
            [],
            2026,
            11,
            new DateOnly(2026, 10, 10));

        Assert.Single(result.UpcomingOccurrenceIds);
        Assert.False(result.ShowTodayMarker);
    }

    [Fact]
    public void Project_ShowTodayMarker_OnlyForCurrentCalendarMonth()
    {
        var bill = ProjectionTestFixtures.Series(
            SeriesA,
            "Bill",
            10m,
            new DateOnly(2026, 10, 1),
            SpendingFrequency.OneOff);

        var current = SpendingMonthProjection.Project(
            [bill],
            [],
            2026,
            10,
            new DateOnly(2026, 10, 15));
        var other = SpendingMonthProjection.Project(
            [bill],
            [],
            2026,
            11,
            new DateOnly(2026, 10, 15));

        Assert.True(current.ShowTodayMarker);
        Assert.False(other.ShowTodayMarker);
    }
}
