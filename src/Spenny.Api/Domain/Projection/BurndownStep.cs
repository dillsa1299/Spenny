namespace Spenny.Api.Domain.Projection;

public sealed record BurndownStep(DateOnly EffectiveDate, decimal DayTotal, decimal RemainingAfter);
