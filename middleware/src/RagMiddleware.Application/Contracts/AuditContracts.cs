namespace RagMiddleware.Application.Contracts;

public sealed record AuditEntry(
    Guid? UserId,
    string Action,
    string Method,
    string Endpoint,
    int StatusCode,
    string? IpAddress,
    string CorrelationId,
    long DurationMilliseconds,
    string? SanitizedRequestSummary);

public interface IAuditLogService
{
    Task WriteAsync(AuditEntry entry, CancellationToken cancellationToken);
}
