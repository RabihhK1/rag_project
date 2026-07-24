using RagMiddleware.Domain.Identity;

namespace RagMiddleware.Application.Contracts;

public sealed record AccessTokenResult(string AccessToken, DateTimeOffset ExpiresAtUtc);

public sealed record RefreshTokenIssueResult(Guid UserId, string RawToken, DateTimeOffset ExpiresAtUtc);

public interface IJwtTokenService
{
    AccessTokenResult Create(ApplicationUser user, IReadOnlyCollection<string> roles);
}

public interface IRefreshTokenService
{
    Task<RefreshTokenIssueResult> IssueAsync(Guid userId, string? ipAddress, CancellationToken cancellationToken);

    Task<RefreshTokenIssueResult?> RotateAsync(string rawToken, string? ipAddress, CancellationToken cancellationToken);

    Task RevokeAsync(string rawToken, CancellationToken cancellationToken);
}
