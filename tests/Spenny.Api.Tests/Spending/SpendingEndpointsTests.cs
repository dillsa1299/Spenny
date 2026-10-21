// Integration tests for Spending series CRUD, month bundle, and tenant isolation.
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Spenny.Api.Domain.Spending;
using Spenny.Api.Tests.Support;

namespace Spenny.Api.Tests.Spending;

public class SpendingEndpointsTests
{
    private static readonly DateTimeOffset FixedUtc =
        new(2026, 10, 10, 11, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task UnverifiedUser_CannotAccessSpendingApi()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.RegisterAsync(client, "spend-unverified@example.com", "User");

        var month = await client.GetAsync("/api/spending/months/2026/10");
        Assert.Equal(HttpStatusCode.Unauthorized, month.StatusCode);
    }

    [Fact]
    public async Task CreateSeries_MonthReturnsProjectedOccurrences()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "spender@example.com", "Spender");

        var create = await client.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Cleaner",
            amount = 40m,
            anchorDate = "2026-10-03",
            frequency = SpendingFrequency.Weekly,
            category = SpendingCategory.General,
            roundWeekendToFriday = false,
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var month = await client.GetFromJsonAsync<MonthPayload>("/api/spending/months/2026/10");
        Assert.NotNull(month);
        Assert.Equal(200m, month.MonthTotal);
        Assert.Equal(5, month.Occurrences.Count);
        Assert.True(month.ShowTodayMarker);
        Assert.Equal(new DateOnly(2026, 10, 10), month.AsOfDate);
    }

    [Fact]
    public async Task SeriesCrud_ListUpdateDelete()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "crud@example.com", "Crud");

        var create = await client.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Gym",
            amount = 30m,
            anchorDate = "2026-10-15",
            frequency = SpendingFrequency.OneOff,
            category = SpendingCategory.PersonalCare,
            roundWeekendToFriday = false,
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<SeriesPayload>();
        Assert.NotNull(created);

        var list = await client.GetFromJsonAsync<List<SeriesPayload>>("/api/spending/series");
        Assert.Single(list!);
        Assert.Equal("Gym", list![0].Name);

        var update = await client.PutAsJsonAsync($"/api/spending/series/{created!.Id}", new
        {
            name = "Gym Plus",
            amount = 35m,
            anchorDate = "2026-10-15",
            frequency = SpendingFrequency.OneOff,
            category = SpendingCategory.PersonalCare,
            roundWeekendToFriday = false,
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var delete = await client.DeleteAsync($"/api/spending/series/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        list = await client.GetFromJsonAsync<List<SeriesPayload>>("/api/spending/series");
        Assert.Empty(list!);
    }

    [Fact]
    public async Task SkipException_RemovesOccurrenceFromMonth()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "skip-exc@example.com", "Skip");

        var create = await client.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Rent",
            amount = 500m,
            anchorDate = "2026-01-01",
            frequency = SpendingFrequency.Monthly,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        var series = await create.Content.ReadFromJsonAsync<SeriesPayload>();
        Assert.NotNull(series);

        var skip = await client.PutAsJsonAsync(
            $"/api/spending/series/{series!.Id}/exceptions/2026-10-01",
            new { isSkipped = true });
        Assert.Equal(HttpStatusCode.OK, skip.StatusCode);

        var month = await client.GetFromJsonAsync<MonthPayload>("/api/spending/months/2026/10");
        Assert.NotNull(month);
        Assert.Empty(month!.Occurrences);
        Assert.Equal(0m, month.MonthTotal);
    }

    [Fact]
    public async Task EditException_ChangesMonthTotal()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "edit-exc@example.com", "Edit");

        var create = await client.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Rent",
            amount = 500m,
            anchorDate = "2026-01-01",
            frequency = SpendingFrequency.Monthly,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        var series = await create.Content.ReadFromJsonAsync<SeriesPayload>();
        Assert.NotNull(series);

        var edit = await client.PutAsJsonAsync(
            $"/api/spending/series/{series!.Id}/exceptions/2026-10-01",
            new
            {
                isSkipped = false,
                name = "Rent",
                amount = 400m,
                category = SpendingCategory.Bills,
            });
        Assert.Equal(HttpStatusCode.OK, edit.StatusCode);

        var month = await client.GetFromJsonAsync<MonthPayload>("/api/spending/months/2026/10");
        Assert.NotNull(month);
        Assert.Single(month!.Occurrences);
        Assert.Equal(400m, month.MonthTotal);
        Assert.Equal(400m, month.Occurrences[0].Amount);
    }

    [Fact]
    public async Task DeleteException_SkipsOccurrence()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "del-exc@example.com", "Del");

        var create = await client.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Rent",
            amount = 500m,
            anchorDate = "2026-01-01",
            frequency = SpendingFrequency.Monthly,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        var series = await create.Content.ReadFromJsonAsync<SeriesPayload>();
        Assert.NotNull(series);

        var delete = await client.DeleteAsync(
            $"/api/spending/series/{series!.Id}/exceptions/2026-10-01");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var month = await client.GetFromJsonAsync<MonthPayload>("/api/spending/months/2026/10");
        Assert.NotNull(month);
        Assert.Empty(month!.Occurrences);
    }

    [Fact]
    public async Task SeriesUpdate_PreservesExistingException()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, client, "preserve@example.com", "Preserve");

        var create = await client.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Rent",
            amount = 500m,
            anchorDate = "2026-01-01",
            frequency = SpendingFrequency.Monthly,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        var series = await create.Content.ReadFromJsonAsync<SeriesPayload>();
        Assert.NotNull(series);

        await client.PutAsJsonAsync(
            $"/api/spending/series/{series!.Id}/exceptions/2026-10-01",
            new
            {
                isSkipped = false,
                name = "Rent",
                amount = 400m,
                category = SpendingCategory.Bills,
            });

        var update = await client.PutAsJsonAsync($"/api/spending/series/{series.Id}", new
        {
            name = "Rent updated",
            amount = 600m,
            anchorDate = "2026-01-01",
            frequency = SpendingFrequency.Monthly,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);

        var month = await client.GetFromJsonAsync<MonthPayload>("/api/spending/months/2026/10");
        Assert.NotNull(month);
        Assert.Single(month!.Occurrences);
        Assert.Equal(400m, month.Occurrences[0].Amount);
    }

    [Fact]
    public async Task TenantIsolation_UserBCannotMutateUserAException()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var clientA = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        using var clientB = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, clientA, "exc-a@example.com", "A");
        var create = await clientA.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Bill",
            amount = 50m,
            anchorDate = "2026-10-05",
            frequency = SpendingFrequency.Weekly,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        var series = await create.Content.ReadFromJsonAsync<SeriesPayload>();
        Assert.NotNull(series);

        await AuthTestHelpers.SignInVerifiedAsync(factory, clientB, "exc-b@example.com", "B");

        var put = await clientB.PutAsJsonAsync(
            $"/api/spending/series/{series!.Id}/exceptions/2026-10-05",
            new { isSkipped = true });
        Assert.Equal(HttpStatusCode.NotFound, put.StatusCode);
    }

    [Fact]
    public async Task TenantIsolation_UserBCannotMutateUserASeries()
    {
        await using var factory = new SpendingWebApplicationFactory(new FakeTimeProvider(FixedUtc));
        using var clientA = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        using var clientB = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        await AuthTestHelpers.SignInVerifiedAsync(factory, clientA, "user-a@example.com", "User A");
        var create = await clientA.PostAsJsonAsync("/api/spending/series", new
        {
            name = "Secret bill",
            amount = 99m,
            anchorDate = "2026-10-12",
            frequency = SpendingFrequency.OneOff,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        var series = await create.Content.ReadFromJsonAsync<SeriesPayload>();
        Assert.NotNull(series);

        await AuthTestHelpers.SignInVerifiedAsync(factory, clientB, "user-b@example.com", "User B");

        var monthB = await clientB.GetFromJsonAsync<MonthPayload>("/api/spending/months/2026/10");
        Assert.NotNull(monthB);
        Assert.Empty(monthB.Occurrences);

        var put = await clientB.PutAsJsonAsync($"/api/spending/series/{series!.Id}", new
        {
            name = "Hijack",
            amount = 1m,
            anchorDate = "2026-10-12",
            frequency = SpendingFrequency.OneOff,
            category = SpendingCategory.Bills,
            roundWeekendToFriday = false,
        });
        Assert.Equal(HttpStatusCode.NotFound, put.StatusCode);

        var delete = await clientB.DeleteAsync($"/api/spending/series/{series.Id}");
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);

        var monthA = await clientA.GetFromJsonAsync<MonthPayload>("/api/spending/months/2026/10");
        Assert.Single(monthA!.Occurrences);
    }

    private sealed record SeriesPayload(
        Guid Id,
        string Name,
        decimal Amount,
        DateOnly AnchorDate,
        SpendingFrequency Frequency,
        SpendingCategory Category,
        bool RoundWeekendToFriday,
        string? Description);

    private sealed record MonthPayload(
        int Year,
        int Month,
        DateOnly AsOfDate,
        decimal MonthTotal,
        decimal RemainingAtToday,
        bool ShowTodayMarker,
        List<OccurrencePayload> Occurrences);

    private sealed record OccurrencePayload(
        Guid SeriesId,
        DateOnly EffectiveDate,
        decimal Amount);
}
