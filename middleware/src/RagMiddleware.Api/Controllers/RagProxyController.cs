using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using RagMiddleware.Application.Contracts;

namespace RagMiddleware.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("rag")]
[Route("api/v1")]
public sealed class RagProxyController(IRagApiClient ragApiClient) : ControllerBase
{
    [HttpPost("chat")]
    public Task Chat([FromBody] ChatRequest request, CancellationToken cancellationToken) => ProxyAsync(
        "POST", "/chat", request, false, cancellationToken);

    [HttpPost("chat/stream")]
    public Task ChatStream([FromBody] ChatRequest request, CancellationToken cancellationToken) => ProxyAsync(
        "POST", "/chat/stream", request, true, cancellationToken);

    [HttpPost("chat/regenerate")]
    public Task Regenerate([FromBody] RegenerateRequest request, CancellationToken cancellationToken) => ProxyAsync(
        "POST", "/chat/regenerate", request, false, cancellationToken);

    [HttpPost("chat/regenerate/stream")]
    public Task RegenerateStream([FromBody] RegenerateRequest request, CancellationToken cancellationToken) => ProxyAsync(
        "POST", "/chat/regenerate/stream", request, true, cancellationToken);

    [HttpGet("chat/messages/{messageId}/versions")]
    public Task Versions([FromRoute] string messageId, CancellationToken cancellationToken) => ProxyAsync(
        "GET", $"/chat/messages/{Uri.EscapeDataString(messageId)}/versions", null, false, cancellationToken);

    [HttpGet("conversations")]
    public Task Conversations(CancellationToken cancellationToken) => ProxyAsync("GET", "/conversations", null, false, cancellationToken);

    [HttpGet("conversations/{conversationId}/messages")]
    public Task ConversationMessages([FromRoute] string conversationId, CancellationToken cancellationToken) => ProxyAsync(
        "GET", $"/conversations/{Uri.EscapeDataString(conversationId)}/messages", null, false, cancellationToken);

    [HttpPatch("conversations/{conversationId}")]
    public Task RenameConversation([FromRoute] string conversationId, [FromBody] RenameConversationRequest request, CancellationToken cancellationToken) => ProxyAsync(
        "PATCH", $"/conversations/{Uri.EscapeDataString(conversationId)}", request, false, cancellationToken);

    [HttpDelete("conversations/{conversationId}")]
    public Task DeleteConversation([FromRoute] string conversationId, CancellationToken cancellationToken) => ProxyAsync(
        "DELETE", $"/conversations/{Uri.EscapeDataString(conversationId)}", null, false, cancellationToken);

    [HttpGet("feedback")]
    public Task Feedback(CancellationToken cancellationToken) => ProxyAsync("GET", "/feedback", null, false, cancellationToken);

    [HttpGet("feedback/stats")]
    public Task FeedbackStats(CancellationToken cancellationToken) => ProxyAsync("GET", "/feedback/stats", null, false, cancellationToken);

    [HttpPost("feedback")]
    public Task SubmitFeedback([FromBody] FeedbackRequest request, CancellationToken cancellationToken) => ProxyAsync(
        "POST", "/feedback", request, false, cancellationToken);

    [HttpDelete("feedback/{messageId}")]
    public Task DeleteFeedback([FromRoute] string messageId, CancellationToken cancellationToken) => ProxyAsync(
        "DELETE", $"/feedback/{Uri.EscapeDataString(messageId)}", null, false, cancellationToken);

    private async Task ProxyAsync(string method, string path, object? request, bool stream, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"), out var userId))
        {
            Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        var payload = request is null ? null : JsonSerializer.Serialize(request, JsonOptions);
        await using var upstream = await ragApiClient.SendAsync(
            new RagApiRequest(userId, method, path, payload, stream),
            HttpContext.TraceIdentifier,
            cancellationToken);
        if (upstream.StatusCode is < 200 or >= 300)
        {
            Response.StatusCode = upstream.StatusCode is 401 or 403 ? StatusCodes.Status502BadGateway : upstream.StatusCode;
            await Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = Response.StatusCode,
                Title = "The RAG service could not complete this request.",
            }, cancellationToken);
            return;
        }

        Response.StatusCode = upstream.StatusCode;
        Response.ContentType = upstream.Headers.TryGetValue("Content-Type", out var contentType)
            ? contentType.FirstOrDefault() ?? "application/json"
            : stream ? "text/event-stream" : "application/json";
        if (stream)
        {
            Response.Headers.CacheControl = "no-cache";
            Response.Headers["X-Accel-Buffering"] = "no";
        }

        await upstream.Body.CopyToAsync(Response.Body, cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    public sealed class ChatRequest
    {
        [Required]
        [StringLength(4_000, MinimumLength = 1)]
        public string Message { get; init; } = string.Empty;

        public string? ConversationId { get; init; }
    }

    public sealed class RegenerateRequest
    {
        [Required]
        [StringLength(100)]
        public string ConversationId { get; init; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string MessageId { get; init; } = string.Empty;
    }

    public sealed class RenameConversationRequest
    {
        [Required]
        [StringLength(120, MinimumLength = 1)]
        public string Title { get; init; } = string.Empty;
    }

    public sealed class FeedbackRequest
    {
        [Required]
        [StringLength(100)]
        public string MessageId { get; init; } = string.Empty;

        [Required]
        [RegularExpression("^(up|down)$")]
        public string Rating { get; init; } = string.Empty;

        [StringLength(120)]
        public string? Reason { get; init; }

        [StringLength(1_000)]
        public string? Comment { get; init; }
    }
}
