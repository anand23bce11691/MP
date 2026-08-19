namespace IncidentIQ.Domain.Entities;

public class MonitoredApplication
{
    public int MonitoredApplicationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastSeenAt { get; set; }
    public ICollection<MonitoredEndpoint> Endpoints { get; set; } = new List<MonitoredEndpoint>();
    public ICollection<TelemetryEvent> TelemetryEvents { get; set; } = new List<TelemetryEvent>();
    public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
}
