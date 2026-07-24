using System.ComponentModel.DataAnnotations;

namespace RagMiddleware.Application.Options;

public sealed class FrontendOptions
{
    public const string SectionName = "Frontend";

    [Required]
    [Url]
    public string Url { get; init; } = string.Empty;
}
