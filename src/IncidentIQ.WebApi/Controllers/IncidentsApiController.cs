using IncidentIQ.Application.Dtos;
using IncidentIQ.Domain.Enums;
using IncidentIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/incidents")]
public class IncidentsApiController : ControllerBase
{
    private readonly AppDbContext _db;

    public IncidentsApiController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetIncidents([FromQuery] string? status)
    {
        var query = _db.Incidents.Include(i => i.Evidences).AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<IncidentStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(i => i.Status == parsedStatus);
        }

        var incidents = await query.OrderByDescending(i => i.DetectedAt).Take(50).ToListAsync();

        var dtos = incidents.Select(i => new IncidentDto(
            i.IncidentId,
            i.IncidentNumber,
            i.Title,
            i.IncidentType,
            i.Severity,
            i.Status,
            i.DetectedAt,
            i.ResolvedAt,
            i.ConfidencePercentage,
            i.RootCauseSummary,
            i.RecommendedAction,
            i.Evidences.OrderBy(e => e.SequenceOrder).Select(e => new IncidentEvidenceDto(
                e.SequenceOrder, e.Timestamp, e.MetricName, e.ObservedValue, e.BaselineValue, e.Description
            )).ToList()
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetIncident(int id)
    {
        var i = await _db.Incidents.Include(x => x.Evidences).FirstOrDefaultAsync(x => x.IncidentId == id);
        if (i == null) return NotFound();

        var dto = new IncidentDto(
            i.IncidentId,
            i.IncidentNumber,
            i.Title,
            i.IncidentType,
            i.Severity,
            i.Status,
            i.DetectedAt,
            i.ResolvedAt,
            i.ConfidencePercentage,
            i.RootCauseSummary,
            i.RecommendedAction,
            i.Evidences.OrderBy(e => e.SequenceOrder).Select(e => new IncidentEvidenceDto(
                e.SequenceOrder, e.Timestamp, e.MetricName, e.ObservedValue, e.BaselineValue, e.Description
            )).ToList()
        );

        return Ok(dto);
    }

    [HttpPost("{id:int}/resolve")]
    public async Task<IActionResult> ResolveIncident(int id)
    {
        var incident = await _db.Incidents.FirstOrDefaultAsync(x => x.IncidentId == id);
        if (incident == null) return NotFound();

        incident.Status = IncidentStatus.Resolved;
        incident.ResolvedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Incident {incident.IncidentNumber} successfully resolved.", incidentId = id, status = incident.Status.ToString() });
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetRecentMetrics([FromQuery] int limit = 60)
    {
        var metrics = await _db.SystemMetrics
            .OrderByDescending(m => m.Timestamp)
            .Take(limit)
            .ToListAsync();

        metrics.Reverse();
        return Ok(metrics);
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetRecentLogs([FromQuery] int limit = 50)
    {
        var logs = await _db.ApplicationLogs
            .OrderByDescending(l => l.Timestamp)
            .Take(limit)
            .ToListAsync();

        return Ok(logs);
    }
}
