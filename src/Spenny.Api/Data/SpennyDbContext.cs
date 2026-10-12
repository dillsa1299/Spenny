// EF Core database context for Spenny persistence (PostgreSQL).
// Entity sets for auth and Spending land in follow-up issues; this context exists so migrations and CI can verify connectivity.
using Microsoft.EntityFrameworkCore;

namespace Spenny.Api.Data;

public sealed class SpennyDbContext(DbContextOptions<SpennyDbContext> options) : DbContext(options)
{
}
