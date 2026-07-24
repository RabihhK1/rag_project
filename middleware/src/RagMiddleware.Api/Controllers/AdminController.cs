using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RagMiddleware.Infrastructure.Persistence;

namespace RagMiddleware.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/v1/admin")]
public sealed class AdminController(ApplicationDbContext database) : ControllerBase
{
    [HttpGet("audit-logs")]
    public async Task<IActionResult> AuditLogs(
        [FromQuery] int page = 1,
        [FromQuery(Name = "page_size")] int pageSize = 50,
        [FromQuery(Name = "user_id")] Guid? userId = null,
        [FromQuery] string? action = null,
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize is < 1 or > 100)
        {
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["page"] = ["page must be at least 1."],
                ["page_size"] = ["page_size must be between 1 and 100."],
            }));
        }

        var query = database.AuditLogs.AsNoTracking();
        if (userId.HasValue)
        {
            query = query.Where(log => log.UserId == userId);
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(log => log.Action == action);
        }

        if (from.HasValue)
        {
            query = query.Where(log => log.TimestampUtc >= from);
        }

        if (to.HasValue)
        {
            query = query.Where(log => log.TimestampUtc <= to);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(log => log.TimestampUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(log => new
            {
                id = log.Id,
                user_id = log.UserId,
                action = log.Action,
                method = log.Method,
                endpoint = log.Endpoint,
                status = log.StatusCode,
                ip = log.IpAddress,
                correlation_id = log.CorrelationId,
                timestamp = log.TimestampUtc,
                duration_ms = log.DurationMilliseconds,
                summary = log.SanitizedRequestSummary,
            })
            .ToListAsync(cancellationToken);

        return Ok(new { items, page, page_size = pageSize, total });
    }
}
