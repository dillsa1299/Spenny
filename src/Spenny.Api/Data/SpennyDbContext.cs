// EF Core database context for Spenny persistence (PostgreSQL) including Identity and login audit.
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Spenny.Api.Auth;

namespace Spenny.Api.Data;

public sealed class SpennyDbContext(DbContextOptions<SpennyDbContext> options)
    : IdentityDbContext<SpennyUser>(options)
{
    public DbSet<LoginAuditEvent> LoginAuditEvents => Set<LoginAuditEvent>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<SpennyUser>(entity =>
        {
            entity.Property(u => u.DisplayName).HasMaxLength(100);
            entity.Property(u => u.AuthProvider).HasConversion<string>().HasMaxLength(16);
        });

        builder.Entity<LoginAuditEvent>(entity =>
        {
            entity.HasIndex(e => e.OccurredAtUtc);
            entity.Property(e => e.UserId).HasMaxLength(450);
        });
    }
}
