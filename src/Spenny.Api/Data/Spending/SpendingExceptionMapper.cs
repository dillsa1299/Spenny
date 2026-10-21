using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Data.Spending;

internal static class SpendingExceptionMapper
{
    public static SpendingException ToDomain(SpendingExceptionEntity entity) =>
        new(
            entity.SeriesId,
            entity.OccurrenceDate,
            entity.IsSkipped,
            entity.Name,
            entity.Amount,
            entity.Category,
            entity.Description);

    public static void Apply(SpendingExceptionEntity entity, UpsertSpendingExceptionRequest request)
    {
        entity.IsSkipped = request.IsSkipped;
        entity.Name = request.Name;
        entity.Amount = request.Amount;
        entity.Category = request.Category;
        entity.Description = request.Description;
    }
}

/// <summary>Validated upsert payload for a single occurrence exception.</summary>
public sealed record UpsertSpendingExceptionRequest(
    bool IsSkipped,
    string? Name,
    decimal? Amount,
    SpendingCategory? Category,
    string? Description);
