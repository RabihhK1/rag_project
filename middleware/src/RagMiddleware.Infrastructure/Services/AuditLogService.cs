using RagMiddleware.Application.Contracts;
using RagMiddleware.Domain.Entities;
using RagMiddleware.Infrastructure.Persistence;

namespace RagMiddleware.Infrastructure.Services;

public sealed class AuditLogService(ApplicationDbContext database) : IAuditLogService
{
    public async Task WriteAsync(AuditEntry entry, CancellationToken cancellationToken)
    {
        database.AuditLogs.Add(new AuditLog
        {
            UserId = entry.UserId,
            Action = entry.Action,
            Method = entry.Method,
            Endpoint = entry.Endpoint,
            StatusCode = entry.StatusCode,
            IpAddress = entry.IpAddress,
            CorrelationId = entry.CorrelationId,
            DurationMilliseconds = entry.DurationMilliseconds,
            SanitizedRequestSummary = entry.SanitizedRequestSummary,
        });
        await database.SaveChangesAsync(cancellationToken);
    }
}
