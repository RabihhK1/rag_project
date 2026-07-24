using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RagMiddleware.Application.Contracts;
using RagMiddleware.Application.Options;
using RagMiddleware.Domain.Entities;
using RagMiddleware.Infrastructure.Persistence;

namespace RagMiddleware.Infrastructure.Services;

public sealed class RefreshTokenService(
    ApplicationDbContext database,
    IOptions<JwtOptions> options) : IRefreshTokenService
{
    private readonly JwtOptions _options = options.Value;

    public async Task<RefreshTokenIssueResult> IssueAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        var rawToken = CreateRawToken();
        var expiry = DateTimeOffset.UtcNow.AddDays(_options.RefreshTokenLifetimeDays);
        database.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            TokenHash = Hash(rawToken),
            ExpiresAtUtc = expiry,
            CreatedByIp = ipAddress,
        });
        await database.SaveChangesAsync(cancellationToken);
        return new RefreshTokenIssueResult(userId, rawToken, expiry);
    }

    public async Task<RefreshTokenIssueResult?> RotateAsync(
        string rawToken,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var current = await database.RefreshTokens.SingleOrDefaultAsync(
            token => token.TokenHash == Hash(rawToken),
            cancellationToken);

        if (current is null || !current.IsActive(now))
        {
            return null;
        }

        var replacementRawToken = CreateRawToken();
        var expiry = now.AddDays(_options.RefreshTokenLifetimeDays);
        var replacement = new RefreshToken
        {
            UserId = current.UserId,
            TokenHash = Hash(replacementRawToken),
            ExpiresAtUtc = expiry,
            CreatedByIp = ipAddress,
        };
        current.RevokedAtUtc = now;
        current.ReplacedByTokenId = replacement.Id;
        database.RefreshTokens.Add(replacement);
        await database.SaveChangesAsync(cancellationToken);
        return new RefreshTokenIssueResult(current.UserId, replacementRawToken, expiry);
    }

    public async Task RevokeAsync(string rawToken, CancellationToken cancellationToken)
    {
        var token = await database.RefreshTokens.SingleOrDefaultAsync(
            item => item.TokenHash == Hash(rawToken),
            cancellationToken);
        if (token is null || token.RevokedAtUtc is not null)
        {
            return;
        }

        token.RevokedAtUtc = DateTimeOffset.UtcNow;
        await database.SaveChangesAsync(cancellationToken);
    }

    internal static string Hash(string rawToken) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

    private static string CreateRawToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
        .Replace("+", "-", StringComparison.Ordinal)
        .Replace("/", "_", StringComparison.Ordinal)
        .TrimEnd('=');
}
