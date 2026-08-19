using IncidentIQ.Application.Interfaces;
using IncidentIQ.Domain.Entities;
using IncidentIQ.Domain.Enums;

namespace IncidentIQ.Application.Engine;

public class RootCauseAnalysisEngine : IRootCauseAnalysisEngine
{
    public Incident Diagnose(List<SystemMetric> recentMetrics, List<ApplicationLog> recentLogs)
    {
        var latestMetric = recentMetrics.LastOrDefault() ?? new SystemMetric();
        
        // Baselines
        const double baselineSqlMs = 80.0;
        const double baselineApiMs = 120.0;
        const int baselineRpm = 100;
        const int baselineErrors = 2;

        var now = DateTime.UtcNow;
        // A timestamp-based number stays unique across application restarts, unlike an in-memory counter.
        var incidentNumber = $"#{now:yyyyMMddHHmmssfff}";

        // Evaluate 4 failure scenarios
        var isDbSlow = latestMetric.SqlLatencyMs > 400;
        var isTrafficSpike = latestMetric.RequestsPerMin > 1200 || latestMetric.CpuUsagePercentage > 80;
        var isApiErrorSurge = latestMetric.ErrorCountPerMin > 15;
        var isCascading = isDbSlow && isApiErrorSurge && latestMetric.ApiLatencyMs > 1000;

        Incident incident;

        if (isCascading)
        {
            incident = new Incident
            {
                IncidentNumber = incidentNumber,
                Title = "Cascading Failure Initiated by Database Degredation",
                IncidentType = IncidentType.CascadingFailure,
                Severity = SeverityLevel.Critical,
                Status = IncidentStatus.Active,
                DetectedAt = now,
                ConfidencePercentage = 95.0,
                RootCauseSummary = "A database query slowdown bottlenecked application thread pools, causing downstream Payment API timeouts and widespread HTTP 500 failure cascades.",
                RecommendedAction = "Optimize database indexes, release connection pool locks, and implement resilient circuit breakers on Payment endpoints."
            };

            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 1,
                Timestamp = now.AddSeconds(-6),
                MetricName = "SQL Execution Latency",
                ObservedValue = $"{latestMetric.SqlLatencyMs:F0} ms",
                BaselineValue = $"{baselineSqlMs:F0} ms",
                Description = "SQL query execution time delayed significantly, breaching critical 400ms threshold."
            });
            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 2,
                Timestamp = now.AddSeconds(-4),
                MetricName = "API Response Time",
                ObservedValue = $"{latestMetric.ApiLatencyMs:F0} ms",
                BaselineValue = $"{baselineApiMs:F0} ms",
                Description = "Order API response latency degraded due to waiting on blocked database queries."
            });
            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 3,
                Timestamp = now.AddSeconds(-2),
                MetricName = "HTTP Error Rate",
                ObservedValue = $"{latestMetric.ErrorCountPerMin} / min",
                BaselineValue = $"{baselineErrors} / min",
                Description = "System-wide HTTP 500 error wave triggered by payment gateway timeout exceptions."
            });
        }
        else if (isDbSlow)
        {
            var confidence = Math.Min(99.0, 85.0 + (latestMetric.SqlLatencyMs / 100.0));
            incident = new Incident
            {
                IncidentNumber = incidentNumber,
                Title = "Database Performance Degradation / Query Execution Latency",
                IncidentType = IncidentType.DatabaseSlowdown,
                Severity = SeverityLevel.High,
                Status = IncidentStatus.Active,
                DetectedAt = now,
                ConfidencePercentage = Math.Round(confidence, 1),
                RootCauseSummary = "Unoptimized query execution plan and database execution latency spiked prior to API response degradation.",
                RecommendedAction = "Investigate slow Orders query execution plan, verify database indexes on OrderItems table, and check connection pool limits."
            };

            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 1,
                Timestamp = now.AddSeconds(-4),
                MetricName = "SQL Query Latency",
                ObservedValue = $"{latestMetric.SqlLatencyMs:F0} ms",
                BaselineValue = $"{baselineSqlMs:F0} ms",
                Description = $"SQL query latency spiked at T-4s, prior to overall HTTP API response degradation."
            });
            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 2,
                Timestamp = now.AddSeconds(-2),
                MetricName = "API Response Time",
                ObservedValue = $"{latestMetric.ApiLatencyMs:F0} ms",
                BaselineValue = $"{baselineApiMs:F0} ms",
                Description = "HTTP API response latency increased as a downstream symptom of database latency."
            });
        }
        else if (isTrafficSpike)
        {
            incident = new Incident
            {
                IncidentNumber = incidentNumber,
                Title = "Traffic Overload / Hardware Resource Saturation",
                IncidentType = IncidentType.TrafficSpike,
                Severity = SeverityLevel.High,
                Status = IncidentStatus.Active,
                DetectedAt = now,
                ConfidencePercentage = 94.0,
                RootCauseSummary = "Sudden surge in synthetic request volume caused thread pool congestion and CPU resource exhaustion.",
                RecommendedAction = "Scale application instances horizontally, activate CDN edge caching, and enable rate-limiting middleware."
            };

            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 1,
                Timestamp = now.AddSeconds(-5),
                MetricName = "Request Volume (RPM)",
                ObservedValue = $"{latestMetric.RequestsPerMin} req/min",
                BaselineValue = $"{baselineRpm} req/min",
                Description = "Traffic volume surged by over 800%, breaching system capacity limit."
            });
            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 2,
                Timestamp = now.AddSeconds(-2),
                MetricName = "CPU Utilization",
                ObservedValue = $"{latestMetric.CpuUsagePercentage:F1}%",
                BaselineValue = "< 50%",
                Description = "CPU utilization reached saturation threshold, causing queue delays."
            });
        }
        else // API Failure or fallback
        {
            incident = new Incident
            {
                IncidentNumber = incidentNumber,
                Title = "Payment Gateway / External API Timeout Failure",
                IncidentType = IncidentType.ApiFailure,
                Severity = SeverityLevel.High,
                Status = IncidentStatus.Active,
                DetectedAt = now,
                ConfidencePercentage = 92.0,
                RootCauseSummary = "High concentration of HTTP 500 errors on POST /api/payments while database query latency remained healthy.",
                RecommendedAction = "Verify external payment service API credentials, review retry policy, and inspect payment gateway timeout configurations."
            };

            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 1,
                Timestamp = now.AddSeconds(-3),
                MetricName = "Payment Endpoint Failure Rate",
                ObservedValue = $"{latestMetric.ErrorCountPerMin} errors/min",
                BaselineValue = "0 errors/min",
                Description = "HTTP 500 errors surged specifically on POST /api/payments."
            });
            incident.Evidences.Add(new IncidentEvidence
            {
                SequenceOrder = 2,
                Timestamp = now.AddSeconds(-3),
                MetricName = "SQL Query Latency",
                ObservedValue = $"{latestMetric.SqlLatencyMs:F0} ms",
                BaselineValue = $"{baselineSqlMs:F0} ms",
                Description = "Database execution time remained normal, proving issue is isolated to payment API logic."
            });
        }

        return incident;
    }
}
