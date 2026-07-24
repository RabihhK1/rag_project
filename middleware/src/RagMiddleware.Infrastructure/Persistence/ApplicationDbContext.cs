using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RagMiddleware.Domain.Entities;
using RagMiddleware.Domain.Identity;

namespace RagMiddleware.Infrastructure.Persistence;

public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.DisplayName).HasMaxLength(200);
            entity.Property(user => user.AvatarUrl).HasMaxLength(2_048);
            entity.HasIndex(user => user.CreatedAtUtc);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(token => token.Id);
            entity.Property(token => token.TokenHash).HasMaxLength(128).IsRequired();
            entity.Property(token => token.CreatedByIp).HasMaxLength(64);
            entity.HasIndex(token => token.TokenHash).IsUnique();
            entity.HasIndex(token => new { token.UserId, token.ExpiresAtUtc });
        });

        builder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(log => log.Id);
            entity.Property(log => log.Action).HasMaxLength(80).IsRequired();
            entity.Property(log => log.Method).HasMaxLength(10).IsRequired();
            entity.Property(log => log.Endpoint).HasMaxLength(256).IsRequired();
            entity.Property(log => log.IpAddress).HasMaxLength(64);
            entity.Property(log => log.CorrelationId).HasMaxLength(100).IsRequired();
            entity.Property(log => log.SanitizedRequestSummary).HasMaxLength(1_000);
            entity.HasIndex(log => log.TimestampUtc);
            entity.HasIndex(log => new { log.UserId, log.Action, log.TimestampUtc });
        });
    }
}
