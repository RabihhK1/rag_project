namespace RagMiddleware.Application.Options;

public sealed class AuthorizationOptions
{
    public const string SectionName = "Authorization";

    public IReadOnlyCollection<string> AdminEmails { get; init; } = Array.Empty<string>();
}
