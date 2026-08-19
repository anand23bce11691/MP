namespace IncidentIQ.Domain.Entities;

public class IncidentEvidence
{
    public int EvidenceId { get; set; }
    public int IncidentId { get; set; }
    public int SequenceOrder { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string MetricName { get; set; } = string.Empty;
    public string ObservedValue { get; set; } = string.Empty;
    public string BaselineValue { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public Incident? Incident { get; set; }
}
