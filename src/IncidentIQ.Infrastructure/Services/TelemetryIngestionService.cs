using IncidentIQ.Domain.Entities;
using IncidentIQ.Domain.Enums;
using IncidentIQ.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.Infrastructure.Services;

public class TelemetryIngestionService
{
    private readonly AppDbContext _db;

    public TelemetryIngestionService(AppDbContext db) => _db = db;

    public async Task<TelemetryEvent> RecordAsync(TelemetryEvent telemetry, CancellationToken cancellationToken = default)
    {
        _db.TelemetryEvents.Add(telemetry);
        var application = await _db.MonitoredApplications.FindAsync([telemetry.MonitoredApplicationId], cancellationToken);
        if (application is not null) application.LastSeenAt = DateTime.UtcNow;

        var isFailure = telemetry.StatusCode >= 500 || telemetry.DurationMs >= 1500 ||
                        string.Equals(telemetry.Severity, "Error", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(telemetry.Severity, "Critical", StringComparison.OrdinalIgnoreCase);
        if (isFailure && application is not null)
        {
            var recentDuplicate = await _db.Incidents.AnyAsync(i =>
                i.MonitoredApplicationId == application.MonitoredApplicationId &&
                i.Status != IncidentStatus.Resolved &&
                i.DetectedAt > DateTime.UtcNow.AddMinutes(-5), cancellationToken);

            if (!recentDuplicate)
            {
                var rootCause = telemetry.StatusCode >= 500
                    ? "The monitored application returned a server error. Inspect the target application's error log and the affected dependency."
                    : "The monitored endpoint exceeded the 1,500 ms latency threshold. Inspect upstream dependencies, database queries, and resource saturation.";
                var action = telemetry.StatusCode >= 500
                    ? "Review the target application's exception trace, dependency health, and the request that produced the 5xx response."
                    : "Compare recent latency with the endpoint baseline; review database execution, external API latency, and CPU/memory pressure.";

                _db.Incidents.Add(new Incident
                {
                    IncidentNumber = $"#{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                    Title = telemetry.StatusCode >= 500 ? "External application server error" : "External endpoint latency degradation",
                    IncidentType = telemetry.StatusCode >= 500 ? IncidentType.ApiFailure : IncidentType.DatabaseSlowdown,
                    Severity = telemetry.StatusCode >= 500 ? SeverityLevel.High : SeverityLevel.Medium,
                    Status = IncidentStatus.Active,
                    DetectedAt = DateTime.UtcNow,
                    ConfidencePercentage = telemetry.StatusCode >= 500 ? 92 : 78,
                    RootCauseSummary = rootCause,
                    RecommendedAction = action,
                    MonitoredApplicationId = application.MonitoredApplicationId,
                    Evidences = new List<IncidentEvidence>
                    {
                        new()
                        {
                            SequenceOrder = 1,
                            Timestamp = telemetry.Timestamp,
                            MetricName = telemetry.StatusCode >= 500 ? "HTTP status" : "Response time",
                            ObservedValue = telemetry.StatusCode >= 500 ? telemetry.StatusCode!.Value.ToString() : $"{telemetry.DurationMs:F0} ms",
                            BaselineValue = telemetry.StatusCode >= 500 ? "2xx/3xx" : "< 1500 ms",
                            Description = telemetry.Message ?? $"Observed on {telemetry.Endpoint ?? application.BaseUrl}."
                        }
                    }
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return telemetry;
    }
}
