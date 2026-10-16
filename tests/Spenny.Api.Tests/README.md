# Spenny.Api.Tests

Integration and unit tests mirror the folder layout of [`src/Spenny.Api`](../../src/Spenny.Api):

| API path | Tests |
|----------|--------|
| `Auth/Endpoints/` | `Auth/Endpoints/*Tests.cs` |
| `Configuration/` | `Configuration/*Tests.cs` |
| `Data/` | `Data/*Tests.cs` |
| `Domain/` | `Domain/**/*Tests.cs` |
| `Spending/` | `Spending/*Tests.cs` |
| `Program.cs` (health, rate limit) | `HealthEndpointTests.cs` (project root) |

Shared WebApplication factories and helpers live under **`Support/`** (not mirrored from production code).
