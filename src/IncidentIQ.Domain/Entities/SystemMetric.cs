namespace IncidentIQ.Domain.Entities;

public class SystemMetric
{
    public long MetricId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public double ApiLatencyMs { get; set; }
    public double SqlLatencyMs { get; set; }
    public int RequestsPerMin { get; set; }
    public int ErrorCountPerMin { get; set; }
    public double CpuUsagePercentage { get; set; }
    public double MemoryUsagePercentage { get; set; }
    public int ActiveDbConnections { get; set; }
}
