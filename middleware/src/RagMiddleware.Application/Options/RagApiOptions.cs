using System.ComponentModel.DataAnnotations;

namespace RagMiddleware.Application.Options;

public sealed class RagApiOptions
{
    public const string SectionName = "RagApi";

    [Required]
    [Url]
    public string BaseUrl { get; init; } = string.Empty;

    [Required]
    [MinLength(32)]
    public string ApiKey { get; init; } = string.Empty;
}
