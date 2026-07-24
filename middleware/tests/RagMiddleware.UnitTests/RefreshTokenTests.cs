using RagMiddleware.Domain.Entities;

namespace RagMiddleware.UnitTests;

public sealed class RefreshTokenTests
{
    [Fact]
    public void IsActive_requires_an_unexpired_and_unrevoked_token()
    {
        var now = DateTimeOffset.UtcNow;
        var token = new RefreshToken { ExpiresAtUtc = now.AddMinutes(1) };

        Assert.True(token.IsActive(now));
        token.RevokedAtUtc = now;
        Assert.False(token.IsActive(now));
    }
}
