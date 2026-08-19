using IncidentIQ.Application.Dtos;
using IncidentIQ.Domain.Entities;
using IncidentIQ.Infrastructure.Data;
using IncidentIQ.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/monitoring")]
public class MonitoringController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TelemetryIngestionService _ingestion;

    public MonitoringController(AppDbContext db, TelemetryIngestionService ingestion)
    {
        _db = db;
        _ingestion = ingestion;
    }

    [HttpGet("applications")]
    public async Task<IActionResult> Applications()
    {
        var rows = await _db.MonitoredApplications.AsNoTracking()
            .Select(a => new ApplicationSummaryDto(a.MonitoredApplicationId, a.Name, a.BaseUrl, a.IsActive, a.LastSeenAt,
                a.Endpoints.Count, a.Incidents.Count(i => i.Status != IncidentIQ.Domain.Enums.IncidentStatus.Resolved)))
            .OrderBy(a => a.Name).ToListAsync();
        return Ok(rows);
    }

    [HttpPost("applications")]
    public async Task<IActionResult> Register([FromBody] RegisterApplicationDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || !Uri.TryCreate(request.BaseUrl, UriKind.Absolute, out _))
            return BadRequest(new { message = "Name and a valid absolute base URL are required." });
        var application = new MonitoredApplication { Name = request.Name.Trim(), BaseUrl = request.BaseUrl.TrimEnd('/'), ApiKey = Convert.ToHexString(RandomNumberGenerator.GetBytes(24)) };
        _db.MonitoredApplications.Add(application);
        await _db.SaveChangesAsync();
        return Created($"/api/monitoring/applications/{application.MonitoredApplicationId}", new { id = application.MonitoredApplicationId, application.Name, application.BaseUrl, apiKey = application.ApiKey });
    }

    [HttpGet("applications/{id:int}")]
    public async Task<IActionResult> Application(int id)
    {
        var app = await _db.MonitoredApplications.Include(a => a.Endpoints).AsNoTracking().FirstOrDefaultAsync(a => a.MonitoredApplicationId == id);
        return app is null ? NotFound() : Ok(app);
    }

    [HttpPost("applications/{id:int}/endpoints")]
    public async Task<IActionResult> AddEndpoint(int id, [FromBody] CreateEndpointDto request)
    {
        if (!await _db.MonitoredApplications.AnyAsync(a => a.MonitoredApplicationId == id)) return NotFound();
        if (string.IsNullOrWhiteSpace(request.Name) || !Uri.TryCreate(request.Url, UriKind.Absolute, out _)) return BadRequest(new { message = "Endpoint name and URL are required." });
        var endpoint = new MonitoredEndpoint { MonitoredApplicationId = id, Name = request.Name, Url = request.Url, Method = request.Method.ToUpperInvariant(), ExpectedStatusCode = request.ExpectedStatusCode, CheckIntervalSeconds = Math.Clamp(request.CheckIntervalSeconds, 5, 3600) };
        _db.MonitoredEndpoints.Add(endpoint);
        await _db.SaveChangesAsync();
        return Ok(endpoint);
    }

    [HttpPost("ingest")]
    public async Task<IActionResult> Ingest([FromHeader(Name = "X-IncidentIQ-Key")] string? apiKey, [FromBody] TelemetryIngestDto request)
    {
        var application = await _db.MonitoredApplications.FirstOrDefaultAsync(a => a.ApiKey == apiKey && a.IsActive);
        if (application is null) return Unauthorized(new { message = "A valid X-IncidentIQ-Key is required." });
        var result = await _ingestion.RecordAsync(new TelemetryEvent { MonitoredApplicationId = application.MonitoredApplicationId, EventType = request.EventType ?? "request", Source = "connected application", Endpoint = request.Endpoint, StatusCode = request.StatusCode, DurationMs = request.DurationMs, Severity = request.Severity ?? "Info", Message = request.Message, Timestamp = request.Timestamp ?? DateTime.UtcNow }, HttpContext.RequestAborted);
        return Accepted(new { result.TelemetryEventId, result.Timestamp });
    }

    [HttpGet("applications/{id:int}/events")]
    public async Task<IActionResult> Events(int id, [FromQuery] int limit = 100)
    {
        var events = await _db.TelemetryEvents.Where(e => e.MonitoredApplicationId == id).OrderByDescending(e => e.Timestamp).Take(Math.Clamp(limit, 1, 500)).AsNoTracking().ToListAsync();
        return Ok(events);
    }
}
