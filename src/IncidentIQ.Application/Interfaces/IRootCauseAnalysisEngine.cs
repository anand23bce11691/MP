using IncidentIQ.Domain.Entities;

namespace IncidentIQ.Application.Interfaces;

public interface IRootCauseAnalysisEngine
{
    Incident Diagnose(List<SystemMetric> recentMetrics, List<ApplicationLog> recentLogs);
}
