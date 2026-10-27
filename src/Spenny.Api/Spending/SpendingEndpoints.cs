// Authenticated CRUD for Spending series templates, month projection, and amount-required-by range total.
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spenny.Api.Auth.Access;
using Spenny.Api.Data;
using Spenny.Api.Data.Spending;
using Spenny.Api.Domain.Projection;
using Spenny.Api.Domain.Scheduling;
using Spenny.Api.Domain.Spending;

namespace Spenny.Api.Spending;

public static class SpendingEndpoints
{
    private const int MaxNameLength = 200;
    private const int MaxDescriptionLength = 500;

    public static IEndpointRouteBuilder MapSpendingEndpoints(this IEndpointRouteBuilder api)
    {
        var spending = api.MapGroup("/spending")
            .RequireAuthorization(DomainAccessAuthorization.PolicyName);

        spending.MapGet("/series", ListSeriesAsync);
        spending.MapPost("/series", CreateSeriesAsync);
        spending.MapPut("/series/{id:guid}", UpdateSeriesAsync);
        spending.MapDelete("/series/{id:guid}", DeleteSeriesAsync);
        spending.MapPut("/series/{seriesId:guid}/exceptions/{occurrenceDate}", UpsertExceptionAsync);
        spending.MapDelete("/series/{seriesId:guid}/exceptions/{occurrenceDate}", SkipOccurrenceAsync);
        spending.MapGet("/months/{year:int}/{month:int}", GetMonthAsync);
        spending.MapGet("/amount-required-by", GetAmountRequiredByAsync);

        return api;
    }

    private static async Task<IResult> ListSeriesAsync(
        ClaimsPrincipal user,
        SpennyDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var entities = await db.SpendingSeries
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

        return Results.Ok(entities.Select(SeriesResponse.FromEntity));
    }

    private static async Task<IResult> CreateSeriesAsync(
        [FromBody] SeriesWriteRequest request,
        ClaimsPrincipal user,
        SpennyDbContext db,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        if (!TryValidateWrite(request, out var validated, out var validationProblem))
        {
            return validationProblem!;
        }

        var entity = new SpendingSeriesEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAtUtc = timeProvider.GetUtcNow(),
        };
        SpendingSeriesMapper.ApplyTemplate(entity, validated!);
        db.SpendingSeries.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Created($"/api/spending/series/{entity.Id}", SeriesResponse.FromEntity(entity));
    }

    private static async Task<IResult> UpdateSeriesAsync(
        Guid id,
        [FromBody] SeriesWriteRequest request,
        ClaimsPrincipal user,
        SpennyDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        if (!TryValidateWrite(request, out var validated, out var validationProblem))
        {
            return validationProblem!;
        }

        var entity = await db.SpendingSeries
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, cancellationToken);
        if (entity is null)
        {
            return Results.NotFound();
        }

        SpendingSeriesMapper.ApplyTemplate(entity, validated!);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(SeriesResponse.FromEntity(entity));
    }

    private static async Task<IResult> DeleteSeriesAsync(
        Guid id,
        ClaimsPrincipal user,
        SpennyDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var entity = await db.SpendingSeries
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId, cancellationToken);
        if (entity is null)
        {
            return Results.NotFound();
        }

        db.SpendingSeries.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> GetMonthAsync(
        int year,
        int month,
        ClaimsPrincipal user,
        SpennyDbContext db,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        if (month is < 1 or > 12)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["month"] = ["Month must be between 1 and 12."],
            });
        }

        var entities = await db.SpendingSeries
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .ToListAsync(cancellationToken);

        var seriesIds = entities.Select(s => s.Id).ToList();
        var exceptionEntities = await db.SpendingExceptions
            .AsNoTracking()
            .Where(e => seriesIds.Contains(e.SeriesId))
            .ToListAsync(cancellationToken);

        var series = entities.Select(SpendingSeriesMapper.ToDomain).ToList();
        var exceptions = exceptionEntities.Select(SpendingExceptionMapper.ToDomain).ToList();
        var asOfDate = LondonCalendar.TodayInLondon(timeProvider);
        var projection = SpendingMonthProjection.Project(series, exceptions, year, month, asOfDate);

        return Results.Ok(MonthResponse.FromProjection(year, month, asOfDate, projection));
    }

    private static async Task<IResult> GetAmountRequiredByAsync(
        DateOnly? targetDate,
        ClaimsPrincipal user,
        SpennyDbContext db,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var asOfDate = LondonCalendar.TodayInLondon(timeProvider);
        if (targetDate is null || targetDate.Value <= asOfDate)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["targetDate"] = ["Target date must be a future date after today."],
            });
        }

        var entities = await db.SpendingSeries
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .ToListAsync(cancellationToken);

        var seriesIds = entities.Select(s => s.Id).ToList();
        var exceptionEntities = await db.SpendingExceptions
            .AsNoTracking()
            .Where(e => seriesIds.Contains(e.SeriesId))
            .ToListAsync(cancellationToken);

        var series = entities.Select(SpendingSeriesMapper.ToDomain).ToList();
        var exceptions = exceptionEntities.Select(SpendingExceptionMapper.ToDomain).ToList();
        var total = AmountRequiredBy.Sum(series, exceptions, asOfDate, targetDate.Value);

        return Results.Ok(new AmountRequiredByResponse(asOfDate, targetDate.Value, total));
    }

    private static async Task<IResult> UpsertExceptionAsync(
        Guid seriesId,
        DateOnly occurrenceDate,
        [FromBody] ExceptionWriteRequest request,
        ClaimsPrincipal user,
        SpennyDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var series = await db.SpendingSeries
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == seriesId && s.UserId == userId, cancellationToken);
        if (series is null)
        {
            return Results.NotFound();
        }

        if (!TryValidateExceptionWrite(request, out var validated, out var validationProblem))
        {
            return validationProblem!;
        }

        var entity = await db.SpendingExceptions
            .FirstOrDefaultAsync(
                e => e.SeriesId == seriesId && e.OccurrenceDate == occurrenceDate,
                cancellationToken);

        if (entity is null)
        {
            entity = new SpendingExceptionEntity
            {
                SeriesId = seriesId,
                OccurrenceDate = occurrenceDate,
            };
            db.SpendingExceptions.Add(entity);
        }

        SpendingExceptionMapper.Apply(entity, validated!);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(ExceptionResponse.FromEntity(entity));
    }

    private static async Task<IResult> SkipOccurrenceAsync(
        Guid seriesId,
        DateOnly occurrenceDate,
        ClaimsPrincipal user,
        SpennyDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = RequireUserId(user);
        if (userId is null)
        {
            return Results.Unauthorized();
        }

        var series = await db.SpendingSeries
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == seriesId && s.UserId == userId, cancellationToken);
        if (series is null)
        {
            return Results.NotFound();
        }

        var entity = await db.SpendingExceptions
            .FirstOrDefaultAsync(
                e => e.SeriesId == seriesId && e.OccurrenceDate == occurrenceDate,
                cancellationToken);

        if (entity is null)
        {
            entity = new SpendingExceptionEntity
            {
                SeriesId = seriesId,
                OccurrenceDate = occurrenceDate,
                IsSkipped = true,
            };
            db.SpendingExceptions.Add(entity);
        }
        else
        {
            entity.IsSkipped = true;
            entity.Name = null;
            entity.Amount = null;
            entity.Category = null;
            entity.Description = null;
        }

        await db.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static string? RequireUserId(ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier);

    private static bool TryValidateWrite(
        SeriesWriteRequest request,
        out UpsertSpendingSeriesRequest? validated,
        out IResult? problem)
    {
        validated = null;
        problem = null;

        var errors = new Dictionary<string, string[]>();

        var name = request.Name?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(name))
        {
            errors["name"] = ["Name is required."];
        }
        else if (name.Length > MaxNameLength)
        {
            errors["name"] = [$"Name must be at most {MaxNameLength} characters."];
        }

        if (request.Amount <= 0)
        {
            errors["amount"] = ["Amount must be greater than zero."];
        }

        if (!Enum.IsDefined(request.Frequency))
        {
            errors["frequency"] = ["Frequency is invalid."];
        }

        if (!Enum.IsDefined(request.Category))
        {
            errors["category"] = ["Category is invalid."];
        }

        var description = request.Description?.Trim();
        if (description?.Length > MaxDescriptionLength)
        {
            errors["description"] = [$"Description must be at most {MaxDescriptionLength} characters."];
        }

        if (errors.Count > 0)
        {
            problem = Results.ValidationProblem(errors);
            return false;
        }

        validated = new UpsertSpendingSeriesRequest(
            name,
            request.Amount,
            request.AnchorDate,
            request.Frequency,
            request.Category,
            request.RoundWeekendToFriday,
            string.IsNullOrEmpty(description) ? null : description);

        return true;
    }

    private static bool TryValidateExceptionWrite(
        ExceptionWriteRequest request,
        out UpsertSpendingExceptionRequest? validated,
        out IResult? problem)
    {
        validated = null;
        problem = null;

        if (request.IsSkipped)
        {
            validated = new UpsertSpendingExceptionRequest(true, null, null, null, null);
            return true;
        }

        var errors = new Dictionary<string, string[]>();

        var name = request.Name?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            errors["name"] = ["Name is required."];
        }
        else if (name.Length > MaxNameLength)
        {
            errors["name"] = [$"Name must be at most {MaxNameLength} characters."];
        }

        if (request.Amount is null or <= 0)
        {
            errors["amount"] = ["Amount must be greater than zero."];
        }

        if (request.Category is null || !Enum.IsDefined(request.Category.Value))
        {
            errors["category"] = ["Category is invalid."];
        }

        var description = request.Description?.Trim();
        if (description?.Length > MaxDescriptionLength)
        {
            errors["description"] = [$"Description must be at most {MaxDescriptionLength} characters."];
        }

        if (errors.Count > 0)
        {
            problem = Results.ValidationProblem(errors);
            return false;
        }

        validated = new UpsertSpendingExceptionRequest(
            false,
            name,
            request.Amount,
            request.Category,
            string.IsNullOrEmpty(description) ? null : description);

        return true;
    }

    private sealed record ExceptionWriteRequest(
        bool IsSkipped,
        string? Name,
        decimal? Amount,
        SpendingCategory? Category,
        string? Description);

    private sealed record ExceptionResponse(
        Guid SeriesId,
        DateOnly OccurrenceDate,
        bool IsSkipped,
        string? Name,
        decimal? Amount,
        SpendingCategory? Category,
        string? Description)
    {
        public static ExceptionResponse FromEntity(SpendingExceptionEntity entity) =>
            new(
                entity.SeriesId,
                entity.OccurrenceDate,
                entity.IsSkipped,
                entity.Name,
                entity.Amount,
                entity.Category,
                entity.Description);
    }

    private sealed record SeriesWriteRequest(
        string? Name,
        decimal Amount,
        DateOnly AnchorDate,
        SpendingFrequency Frequency,
        SpendingCategory Category,
        bool RoundWeekendToFriday,
        string? Description);

    private sealed record SeriesResponse(
        Guid Id,
        string Name,
        decimal Amount,
        DateOnly AnchorDate,
        SpendingFrequency Frequency,
        SpendingCategory Category,
        bool RoundWeekendToFriday,
        string? Description)
    {
        public static SeriesResponse FromEntity(SpendingSeriesEntity entity) =>
            new(
                entity.Id,
                entity.Name,
                entity.Amount,
                entity.AnchorDate,
                entity.Frequency,
                entity.Category,
                entity.RoundWeekendToFriday,
                entity.Description);
    }

    private sealed record OccurrenceIdResponse(Guid SeriesId, DateOnly OccurrenceDate);

    private sealed record OccurrenceResponse(
        OccurrenceIdResponse Id,
        Guid SeriesId,
        DateOnly OccurrenceDate,
        DateOnly EffectiveDate,
        string Name,
        decimal Amount,
        SpendingCategory Category,
        string? Description)
    {
        public static OccurrenceResponse FromDomain(SpendingOccurrence occurrence) =>
            new(
                new OccurrenceIdResponse(occurrence.Id.SeriesId, occurrence.Id.OccurrenceDate),
                occurrence.SeriesId,
                occurrence.OccurrenceDate,
                occurrence.EffectiveDate,
                occurrence.Name,
                occurrence.Amount,
                occurrence.Category,
                occurrence.Description);
    }

    private sealed record BurndownStepResponse(
        DateOnly EffectiveDate,
        decimal DayTotal,
        decimal RemainingAfter);

    private sealed record AmountRequiredByResponse(
        DateOnly AsOfDate,
        DateOnly TargetDate,
        decimal Total);

    private sealed record MonthResponse(
        int Year,
        int Month,
        DateOnly AsOfDate,
        decimal MonthTotal,
        decimal RemainingAtToday,
        bool ShowTodayMarker,
        IReadOnlyList<OccurrenceResponse> Occurrences,
        IReadOnlyList<BurndownStepResponse> BurndownSteps,
        IReadOnlyList<OccurrenceIdResponse> UpcomingOccurrenceIds)
    {
        public static MonthResponse FromProjection(
            int year,
            int month,
            DateOnly asOfDate,
            SpendingMonthProjectionResult projection) =>
            new(
                year,
                month,
                asOfDate,
                projection.MonthTotal,
                projection.RemainingAtToday,
                projection.ShowTodayMarker,
                projection.Occurrences.Select(OccurrenceResponse.FromDomain).ToList(),
                projection.BurndownSteps
                    .Select(s => new BurndownStepResponse(s.EffectiveDate, s.DayTotal, s.RemainingAfter))
                    .ToList(),
                projection.UpcomingOccurrenceIds
                    .Select(id => new OccurrenceIdResponse(id.SeriesId, id.OccurrenceDate))
                    .ToList());
    }
}
