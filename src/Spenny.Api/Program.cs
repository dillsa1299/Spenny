// Spenny Web API entry point: per-IP rate limiting on /api, optional PostgreSQL (EF Core), dev-only CORS for the local SPA.
// Domain routes stay anonymous until in-app auth ships; edge protection per docs/adr/0001.
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Spenny.Api;
using Spenny.Api.Data;

var builder = WebApplication.CreateBuilder(args);

const string corsPolicyName = "SpennySpaDev";
const string apiRateLimitPolicy = "api";

builder.Services.AddOptions<RateLimitSettings>()
    .BindConfiguration(RateLimitSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddRateLimiter(options => options.RejectionStatusCode = StatusCodes.Status429TooManyRequests);

// Settings are read through IOptions so test hosts can override them after Program builds its configuration.
builder.Services.AddOptions<RateLimiterOptions>()
    .Configure<IOptions<RateLimitSettings>>((options, settings) =>
    {
        var limit = settings.Value;

        // shortcut: keyed on remote IP, which is the proxy address behind a reverse proxy; configure
        // forwarded headers (and trusted proxies) when deploying behind one.
        options.AddPolicy(apiRateLimitPolicy, context =>
            RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limit.PermitLimit,
                    Window = TimeSpan.FromSeconds(limit.WindowSeconds),
                    QueueLimit = 0,
                }));
    });

builder.Services.AddSpennyDatabase(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.ApplyMigrationsIfConfigured();

if (app.Environment.IsDevelopment())
{
    app.UseCors(corsPolicyName);
}
else
{
    app.UseHttpsRedirection();
}
app.UseRateLimiter();

var api = app.MapGroup("/api").RequireRateLimiting(apiRateLimitPolicy);

// Deliberately anonymous: exposes only the server time until edge protection is configured.
api.MapGet("/time", () =>
{
    var utc = DateTimeOffset.UtcNow;
    var local = DateTimeOffset.Now;
    return Results.Ok(new
    {
        utc = utc.ToString("O"),
        local = local.ToString("O"),
        timeZoneId = TimeZoneInfo.Local.Id,
    });
})
.AllowAnonymous()
.WithName("GetServerTime");

app.Run();

public partial class Program;
