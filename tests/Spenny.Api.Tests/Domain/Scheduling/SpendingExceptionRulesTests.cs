// Isolated tests for skip-one and edit-one exception behaviour on a single occurrence.
using Spenny.Api.Domain.Scheduling;
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Tests.Domain.Scheduling;

public class SpendingExceptionRulesTests
{
    private static readonly Guid SeriesId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");

    private static SpendingSeries SampleSeries() =>
        new(
            SeriesId,
            "Rent",
            500m,
            new DateOnly(2026, 1, 1),
            SpendingFrequency.Monthly,
            SpendingCategory.Bills,
            RoundWeekendToFriday: false);

    [Fact]
    public void Apply_WhenNoException_UsesSeriesTemplate()
    {
        var series = SampleSeries();
        var occurrenceDate = new DateOnly(2026, 3, 1);
        var effective = new DateOnly(2026, 3, 1);

        var result = SpendingExceptionRules.Apply(series, occurrenceDate, effective, exception: null);

        Assert.NotNull(result);
        Assert.Equal(new OccurrenceId(SeriesId, occurrenceDate), result!.Id);
        Assert.Equal("Rent", result.Name);
        Assert.Equal(500m, result.Amount);
        Assert.Equal(SpendingCategory.Bills, result.Category);
    }

    [Fact]
    public void Apply_WhenSkipped_ReturnsNull()
    {
        var series = SampleSeries();
        var occurrenceDate = new DateOnly(2026, 3, 1);
        var exception = new SpendingException(SeriesId, occurrenceDate, IsSkipped: true);

        var result = SpendingExceptionRules.Apply(
            series,
            occurrenceDate,
            occurrenceDate,
            exception);

        Assert.Null(result);
    }

    [Fact]
    public void Apply_WhenEditOne_OverridesSelectedFieldsOnly()
    {
        var series = SampleSeries();
        var occurrenceDate = new DateOnly(2026, 3, 1);
        var exception = new SpendingException(
            SeriesId,
            occurrenceDate,
            Name: "Rent (promo)",
            Amount: 450m);

        var result = SpendingExceptionRules.Apply(
            series,
            occurrenceDate,
            occurrenceDate,
            exception);

        Assert.NotNull(result);
        Assert.Equal("Rent (promo)", result!.Name);
        Assert.Equal(450m, result.Amount);
        Assert.Equal(SpendingCategory.Bills, result.Category);
    }
}
