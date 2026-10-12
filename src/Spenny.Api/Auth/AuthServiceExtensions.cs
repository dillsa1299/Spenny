// Registers Identity, cookies, email, and domain authorization when a database connection is available.
using Microsoft.AspNetCore.Identity;
using Spenny.Api.Data;

namespace Spenny.Api.Auth;

public static class AuthServiceExtensions
{
    public const string AuthCookieName = "spenny.auth";

    private sealed class AuthServicesRegistered;

    public static IServiceCollection AddSpennyAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<AuthAppSettings>()
            .BindConfiguration(AuthAppSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<EmailSettings>()
            .BindConfiguration(EmailSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddHttpContextAccessor();

        services.AddIdentityCore<SpennyUser>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = true;
            })
            .AddEntityFrameworkStores<SpennyDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                options.Cookie.Name = AuthCookieName;
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.SlidingExpiration = true;
                options.ExpireTimeSpan = TimeSpan.FromDays(14);
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            });

        services.AddDomainAccessAuthorization();

        var emailSettings = configuration.GetSection(EmailSettings.SectionName).Get<EmailSettings>();
        if (!string.IsNullOrWhiteSpace(emailSettings?.SmtpHost))
        {
            services.AddSingleton<ITransactionalEmailSender, SmtpTransactionalEmailSender>();
        }
        else
        {
            services.AddSingleton<ITransactionalEmailSender, LoggingTransactionalEmailSender>();
        }

        services.AddSingleton<AuthServicesRegistered>();

        return services;
    }

    public static bool IsAuthConfigured(this IServiceProvider services)
    {
        return services.GetService<AuthServicesRegistered>() is not null;
    }
}
