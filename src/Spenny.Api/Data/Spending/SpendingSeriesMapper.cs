using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Data.Spending;

internal static class SpendingSeriesMapper
{
    public static SpendingSeries ToDomain(SpendingSeriesEntity entity) =>
        new(
            entity.Id,
            entity.Name,
            entity.Amount,
            entity.AnchorDate,
            entity.Frequency,
            entity.Category,
            entity.RoundWeekendToFriday,
            entity.Description);

    public static void ApplyTemplate(SpendingSeriesEntity entity, UpsertSpendingSeriesRequest request)
    {
        entity.Name = request.Name;
        entity.Amount = request.Amount;
        entity.AnchorDate = request.AnchorDate;
        entity.Frequency = request.Frequency;
        entity.Category = request.Category;
        entity.RoundWeekendToFriday = request.RoundWeekendToFriday;
        entity.Description = request.Description;
    }
}

/// <summary>Shared create/update payload validated before persistence.</summary>
public sealed record UpsertSpendingSeriesRequest(
    string Name,
    decimal Amount,
    DateOnly AnchorDate,
    SpendingFrequency Frequency,
    SpendingCategory Category,
    bool RoundWeekendToFriday,
    string? Description);
