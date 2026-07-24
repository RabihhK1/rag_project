using System.ComponentModel.DataAnnotations;

namespace RagMiddleware.Application.Options;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required]
    [MinLength(64)]
    public string SigningKey { get; init; } = string.Empty;

    [Required]
    public string Issuer { get; init; } = string.Empty;

    [Required]
    public string Audience { get; init; } = string.Empty;

    [Range(1, 60)]
    public int AccessTokenLifetimeMinutes { get; init; } = 15;

    [Range(1, 30)]
    public int RefreshTokenLifetimeDays { get; init; } = 7;
}
