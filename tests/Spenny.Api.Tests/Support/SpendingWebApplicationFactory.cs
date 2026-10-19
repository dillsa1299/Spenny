// Auth test host with fixed TimeProvider for spending month projection.
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Spenny.Api.Tests.Support;

public sealed class SpendingWebApplicationFactory : AuthWebApplicationFactory
{
    public SpendingWebApplicationFactory(TimeProvider? timeProvider = null, bool googleConfigured = false)
        : base(googleConfigured, services =>
        {
            if (timeProvider is null)
            {
                return;
            }

            services.RemoveAll<TimeProvider>();
            services.AddSingleton(timeProvider);
        })
    {
    }
}
