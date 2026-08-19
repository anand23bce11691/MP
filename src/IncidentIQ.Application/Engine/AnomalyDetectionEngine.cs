using IncidentIQ.Application.Interfaces;
using IncidentIQ.Domain.Entities;

namespace IncidentIQ.Application.Engine;

public class AnomalyDetectionEngine : IAnomalyDetectionEngine
{
    private readonly IRootCauseAnalysisEngine _rcaEngine;
    private readonly List<SystemMetric> _rollingMetrics = new();
    private DateTime? _lastIncidentTime;
    private readonly object _lock = new();

    public event Func<Incident, Task>? OnIncidentDetected;

    public AnomalyDetectionEngine(IRootCauseAnalysisEngine rcaEngine)
    {
        _rcaEngine = rcaEngine;
    }

    public async Task ProcessTelemetryWindowAsync(SystemMetric currentMetric, CancellationToken ct = default)
    {
        lock (_lock)
        {
            _rollingMetrics.Add(currentMetric);
            if (_rollingMetrics.Count > 30) // Keep 30-second window
            {
                _rollingMetrics.RemoveAt(0);
            }
        }

        // Anomaly trigger conditions
        var isAnomaly = currentMetric.SqlLatencyMs > 350
                     || currentMetric.ApiLatencyMs > 500
                     || currentMetric.ErrorCountPerMin > 10
                     || currentMetric.RequestsPerMin > 1500
                     || currentMetric.CpuUsagePercentage > 85;

        if (!isAnomaly) return;

        // Prevent duplicate incident spam (15s cooldown between new incident triggers)
        if (_lastIncidentTime.HasValue && (DateTime.UtcNow - _lastIncidentTime.Value).TotalSeconds < 15)
        {
            return;
        }

        _lastIncidentTime = DateTime.UtcNow;

        List<SystemMetric> metricsCopy;
        lock (_lock)
        {
            metricsCopy = _rollingMetrics.ToList();
        }

        var incident = _rcaEngine.Diagnose(metricsCopy, new List<ApplicationLog>());

        if (OnIncidentDetected != null)
        {
            await OnIncidentDetected.Invoke(incident);
        }
    }
}
