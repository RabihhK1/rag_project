using System.Diagnostics;
using System.Security.Claims;
using RagMiddleware.Application.Contracts;

namespace RagMiddleware.Api.Middleware;

public sealed class AuditLoggingMiddleware(RequestDelegate next, ILogger<AuditLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, IAuditLogService auditLogService)
    {
        if (!context.Request.Path.StartsWithSegments("/api/v1"))
        {
            await next(context);
            return;
        }

        var timer = Stopwatch.StartNew();
        try
        {
            await next(context);
        }
        finally
        {
            try
            {
                var userIdValue = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? context.User.FindFirstValue("sub");
                Guid? userId = Guid.TryParse(userIdValue, out var parsedUserId) ? parsedUserId : null;
                await auditLogService.WriteAsync(
                    new AuditEntry(
                        userId,
                        GetAction(context),
                        context.Request.Method,
                        context.Request.Path,
                        context.Response.StatusCode,
                        context.Connection.RemoteIpAddress?.ToString(),
                        context.TraceIdentifier,
                        timer.ElapsedMilliseconds,
                        GetSanitizedSummary(context)),
                    CancellationToken.None);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Audit logging failed for correlation ID {CorrelationId}", context.TraceIdentifier);
            }
        }
    }

    private static string GetAction(HttpContext context) => (context.Request.Method, context.Request.Path.Value) switch
    {
        ("POST", "/api/v1/auth/refresh") => "TOKEN_REFRESH",
        ("POST", "/api/v1/auth/logout") => "LOGOUT",
        ("POST", "/api/v1/chat") or ("POST", "/api/v1/chat/stream") => "RAG_QUERY",
        ("POST", "/api/v1/chat/regenerate") or ("POST", "/api/v1/chat/regenerate/stream") => "RAG_REGENERATE",
        ("PATCH", var path) when path?.StartsWith("/api/v1/conversations/", StringComparison.Ordinal) == true => "CONVERSATION_RENAME",
        ("DELETE", var path) when path?.StartsWith("/api/v1/conversations/", StringComparison.Ordinal) == true => "CONVERSATION_DELETE",
        ("POST", "/api/v1/feedback") => "FEEDBACK_SUBMIT",
        _ => "API_REQUEST",
    };

    private static string? GetSanitizedSummary(HttpContext context)
    {
        var routeValues = context.Request.RouteValues
            .Where(value => value.Value is not null)
            .Select(value => $"{value.Key}={value.Value}");
        var queryNames = context.Request.Query.Keys.Order(StringComparer.Ordinal)
            .Select(key => $"query={key}");
        var summary = string.Join(';', routeValues.Concat(queryNames));
        return string.IsNullOrWhiteSpace(summary) ? null : summary[..Math.Min(summary.Length, 1_000)];
    }
}
