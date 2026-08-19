namespace IncidentIQ.Domain.Entities;

public class TelemetryEvent
{
    public long TelemetryEventId { get; set; }
    public int MonitoredApplicationId { get; set; }
    public string EventType { get; set; } = "request";
    public string Source { get; set; } = "agent";
    public string? Endpoint { get; set; }
    public int? StatusCode { get; set; }
    public double? DurationMs { get; set; }
    public string Severity { get; set; } = "Info";
    public string? Message { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public MonitoredApplication? MonitoredApplication { get; set; }
}
