namespace RagMiddleware.Domain.Entities;

public sealed class AuditLog
{
    public long Id { get; set; }

    public Guid? UserId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string Method { get; set; } = string.Empty;

    public string Endpoint { get; set; } = string.Empty;

    public int StatusCode { get; set; }

    public string? IpAddress { get; set; }

    public string CorrelationId { get; set; } = string.Empty;

    public DateTimeOffset TimestampUtc { get; set; } = DateTimeOffset.UtcNow;

    public long DurationMilliseconds { get; set; }

    public string? SanitizedRequestSummary { get; set; }
}
