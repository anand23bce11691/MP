namespace IncidentIQ.Domain.Entities;

public class MonitoredEndpoint
{
    public int MonitoredEndpointId { get; set; }
    public int MonitoredApplicationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Method { get; set; } = "GET";
    public int ExpectedStatusCode { get; set; } = 200;
    public int CheckIntervalSeconds { get; set; } = 30;
    public bool IsActive { get; set; } = true;
    public DateTime? LastCheckedAt { get; set; }
    public MonitoredApplication? MonitoredApplication { get; set; }
}
