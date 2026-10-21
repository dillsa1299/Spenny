// EF Core database context for Spenny persistence (PostgreSQL) including Identity and login audit.
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Spenny.Api.Auth.Identity;
using Spenny.Api.Data.Spending;

namespace Spenny.Api.Data;

public sealed class SpennyDbContext(DbContextOptions<SpennyDbContext> options)
    : IdentityDbContext<SpennyUser>(options)
{
    public DbSet<LoginAuditEvent> LoginAuditEvents => Set<LoginAuditEvent>();

    public DbSet<SpendingSeriesEntity> SpendingSeries => Set<SpendingSeriesEntity>();

    public DbSet<SpendingExceptionEntity> SpendingExceptions => Set<SpendingExceptionEntity>();

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

        builder.Entity<SpendingSeriesEntity>(entity =>
        {
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Frequency).HasConversion<string>().HasMaxLength(16);
            entity.Property(e => e.Category).HasConversion<string>().HasMaxLength(32);
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<SpendingExceptionEntity>(entity =>
        {
            entity.HasKey(e => new { e.SeriesId, e.OccurrenceDate });
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Category).HasConversion<string>().HasMaxLength(32);
            entity.HasOne(e => e.Series)
                .WithMany()
                .HasForeignKey(e => e.SeriesId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
