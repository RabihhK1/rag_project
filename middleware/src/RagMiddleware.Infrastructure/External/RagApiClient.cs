using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;
using RagMiddleware.Application.Contracts;
using RagMiddleware.Application.Options;

namespace RagMiddleware.Infrastructure.External;

public sealed class RagApiClient(HttpClient client, IOptions<RagApiOptions> options) : IRagApiClient
{
    private readonly RagApiOptions _options = options.Value;

    public async Task<RagApiResponse> SendAsync(
        RagApiRequest request,
        string correlationId,
        CancellationToken cancellationToken)
    {
        using var message = new HttpRequestMessage(new HttpMethod(request.Method), request.Path);
        message.Headers.Add("X-RAG-API-Key", _options.ApiKey);
        message.Headers.Add("X-User-Id", request.UserId.ToString());
        message.Headers.Add("X-Correlation-ID", correlationId);
        message.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue(request.StreamResponse ? "text/event-stream" : "application/json"));

        if (request.JsonBody is not null)
        {
            message.Content = new StringContent(request.JsonBody, Encoding.UTF8, "application/json");
        }

        var response = await client.SendAsync(
            message,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);
        var headers = response.Headers
            .Concat(response.Content.Headers)
            .ToDictionary(header => header.Key, header => header.Value.ToArray(), StringComparer.OrdinalIgnoreCase);
        var body = await response.Content.ReadAsStreamAsync(cancellationToken);
        return new RagApiResponse
        {
            StatusCode = (int)response.StatusCode,
            Headers = headers,
            Body = body,
            ResponseLifetime = response,
        };
    }
}
