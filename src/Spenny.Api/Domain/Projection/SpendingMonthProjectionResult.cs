using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Domain.Projection;

public sealed record SpendingMonthProjectionResult(
    IReadOnlyList<SpendingOccurrence> Occurrences,
    IReadOnlyList<BurndownStep> BurndownSteps,
    decimal MonthTotal,
    decimal RemainingAtToday,
    IReadOnlyList<OccurrenceId> UpcomingOccurrenceIds,
    bool ShowTodayMarker);
