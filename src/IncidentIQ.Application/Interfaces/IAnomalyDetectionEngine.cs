using IncidentIQ.Domain.Entities;

namespace IncidentIQ.Application.Interfaces;

public interface IAnomalyDetectionEngine
{
    Task ProcessTelemetryWindowAsync(SystemMetric currentMetric, CancellationToken ct = default);
}
