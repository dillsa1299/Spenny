// Range total: asOf exclusive, target inclusive, across one or more calendar months.
using Spenny.Api.Domain.Projection;
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Tests.Domain.Projection;

public class AmountRequiredByTests
{
    private static readonly Guid SeriesA = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid SeriesB = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private static readonly Guid SeriesC = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

    [Fact]
    public void Sum_InMonthWindow_ExcludesTodayAndIncludesTarget()
    {
        var onAsOf = ProjectionTestFixtures.Series(
            SeriesA,
            "Today",
            10m,
            new DateOnly(2026, 10, 10),
            SpendingFrequency.OneOff);
        var mid = ProjectionTestFixtures.Series(
            SeriesB,
            "Mid",
            20m,
            new DateOnly(2026, 10, 15),
            SpendingFrequency.OneOff);
        var onTarget = ProjectionTestFixtures.Series(
            SeriesC,
            "Target",
            30m,
            new DateOnly(2026, 10, 20),
            SpendingFrequency.OneOff);

        var total = AmountRequiredBy.Sum(
            [onAsOf, mid, onTarget],
            [],
            new DateOnly(2026, 10, 10),
            new DateOnly(2026, 10, 20));

        Assert.Equal(50m, total);
    }

    [Fact]
    public void Sum_CrossMonthWindow_IncludesOccurrencesInBothMonths()
    {
        var oct = ProjectionTestFixtures.Series(
            SeriesA,
            "Oct",
            40m,
            new DateOnly(2026, 10, 25),
            SpendingFrequency.OneOff);
        var nov = ProjectionTestFixtures.Series(
            SeriesB,
            "Nov",
            60m,
            new DateOnly(2026, 11, 5),
            SpendingFrequency.OneOff);
        var afterTarget = ProjectionTestFixtures.Series(
            SeriesC,
            "Later",
            100m,
            new DateOnly(2026, 11, 10),
            SpendingFrequency.OneOff);

        var total = AmountRequiredBy.Sum(
            [oct, nov, afterTarget],
            [],
            new DateOnly(2026, 10, 10),
            new DateOnly(2026, 11, 5));

        Assert.Equal(100m, total);
    }

    [Fact]
    public void Sum_TargetOutsideCurrentMonth_StillSumsThroughTarget()
    {
        var monthly = ProjectionTestFixtures.Series(
            SeriesA,
            "Rent",
            500m,
            new DateOnly(2026, 1, 1),
            SpendingFrequency.Monthly);

        // asOf Oct 10: Oct 1 already past; Nov 1 and Dec 1 within window through Dec 1.
        var total = AmountRequiredBy.Sum(
            [monthly],
            [],
            new DateOnly(2026, 10, 10),
            new DateOnly(2026, 12, 1));

        Assert.Equal(1000m, total);
    }

    [Fact]
    public void Sum_NoMatchingBills_ReturnsZero()
    {
        var past = ProjectionTestFixtures.Series(
            SeriesA,
            "Past",
            25m,
            new DateOnly(2026, 10, 5),
            SpendingFrequency.OneOff);
        var after = ProjectionTestFixtures.Series(
            SeriesB,
            "After",
            25m,
            new DateOnly(2026, 10, 25),
            SpendingFrequency.OneOff);

        var total = AmountRequiredBy.Sum(
            [past, after],
            [],
            new DateOnly(2026, 10, 10),
            new DateOnly(2026, 10, 20));

        Assert.Equal(0m, total);
    }

    [Fact]
    public void Sum_EmptySeries_ReturnsZero()
    {
        var total = AmountRequiredBy.Sum(
            [],
            [],
            new DateOnly(2026, 10, 10),
            new DateOnly(2026, 10, 20));

        Assert.Equal(0m, total);
    }
}
