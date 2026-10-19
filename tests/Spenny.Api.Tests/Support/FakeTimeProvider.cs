// Fixed clock for integration tests that depend on Europe/London "today".
namespace Spenny.Api.Tests.Support;

internal sealed class FakeTimeProvider(DateTimeOffset utcNow) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => utcNow;
}
