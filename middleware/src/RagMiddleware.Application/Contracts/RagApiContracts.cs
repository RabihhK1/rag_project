namespace RagMiddleware.Application.Contracts;

public sealed record RagApiRequest(
    Guid UserId,
    string Method,
    string Path,
    string? JsonBody = null,
    bool StreamResponse = false);

public sealed class RagApiResponse : IAsyncDisposable
{
    public required int StatusCode { get; init; }

    public required IReadOnlyDictionary<string, string[]> Headers { get; init; }

    public required Stream Body { get; init; }

    public IDisposable? ResponseLifetime { get; init; }

    public async ValueTask DisposeAsync()
    {
        await Body.DisposeAsync();
        ResponseLifetime?.Dispose();
    }
}

public interface IRagApiClient
{
    Task<RagApiResponse> SendAsync(
        RagApiRequest request,
        string correlationId,
        CancellationToken cancellationToken);
}
