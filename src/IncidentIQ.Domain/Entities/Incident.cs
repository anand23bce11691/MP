using IncidentIQ.Domain.Enums;

namespace IncidentIQ.Domain.Entities;

public class Incident
{
    public int IncidentId { get; set; }
    public string IncidentNumber { get; set; } = string.Empty; // e.g. #1024
    public string Title { get; set; } = string.Empty;
    public IncidentType IncidentType { get; set; }
    public SeverityLevel Severity { get; set; }
    public IncidentStatus Status { get; set; } = IncidentStatus.Active;
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public double ConfidencePercentage { get; set; }
    public string RootCauseSummary { get; set; } = string.Empty;
    public string RecommendedAction { get; set; } = string.Empty;
    public int? MonitoredApplicationId { get; set; }
    public MonitoredApplication? MonitoredApplication { get; set; }

    public ICollection<IncidentEvidence> Evidences { get; set; } = new List<IncidentEvidence>();
}
