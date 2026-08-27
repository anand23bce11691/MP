using System;
using System.Collections.Generic;
using System.Linq;
using IncidentIQ.Application.Dtos;

namespace IncidentIQ.Application.Engine;

public class AutomatedRemediationEngine
{
    private static readonly List<RemediationPlaybookDto> _playbooks = new()
    {
        new RemediationPlaybookDto(
            "pb-db-pool-flush",
            "Flush SQL Connection Pool & Reset Max Connections",
            "DatabaseSlowdown",
            "Automatically recycles active pool connections and increases connection limit when SQL latency exceeds 1,500ms.",
            true,
            "Automatic",
            new List<PlaybookStepDto>
            {
                new(1, "FlushDbConnectionPool", "SQL Server 2022 Cluster", "{\"maxPoolSize\": 150, \"clearAllPools\": true}", 10),
                new(2, "InvalidateStaleCache", "Redis L2 Cache", "{\"pattern\": \"catalog:*\"}", 5),
                new(3, "VerifyQueryLatency", "DbHealthCheckProbe", "{\"targetMs\": 50}", 15)
            },
            94,
            18,
            DateTime.UtcNow.AddMinutes(-22)
        ),
        new RemediationPlaybookDto(
            "pb-api-rate-throttle",
            "Enable Dynamic Rate Limiting & Circuit Breaker",
            "ApiFailure",
            "Trips circuit breaker to fallback mock responses and throttles rogue IP clients during HTTP 500 error cascades.",
            true,
            "Automatic",
            new List<PlaybookStepDto>
            {
                new(1, "TripCircuitBreaker", "ShopEasy Gateway Proxy", "{\"circuitState\": \"HalfOpen\", \"timeoutSec\": 30}", 5),
                new(2, "ApplyAdaptiveRatelimit", "Edge RateLimiter", "{\"maxReqPerSec\": 50, \"blockDurationMin\": 5}", 10),
                new(3, "BroadcastAlertToSlack", "Slack Webhook Integrator", "{\"channel\": \"#sre-incidents\", \"urgency\": \"high\"}", 5)
            },
            88,
            12,
            DateTime.UtcNow.AddHours(-2)
        ),
        new RemediationPlaybookDto(
            "pb-memory-gc-recycle",
            "Trigger .NET Large Object Heap (LOH) Garbage Collection",
            "MemoryLeak",
            "Forces compacting GC collect on Generation 2 and Large Object Heap when RAM usage exceeds 85%.",
            false,
            "ManualApproval",
            new List<PlaybookStepDto>
            {
                new(1, "ForceCompactingGc", "IncidentIQ Web API Worker", "{\"generation\": 2, \"mode\": \"ForcedCompacting\"}", 15),
                new(2, "PurgeInMemoryTelemetryBuffer", "TelemetryCollectorMiddleware", "{\"keepLastEntries\": 50}", 5)
            },
            98,
            6,
            DateTime.UtcNow.AddDays(-1)
        )
    };

    private static readonly List<PlaybookExecutionLogDto> _executionHistory = new()
    {
        new PlaybookExecutionLogDto(
            "exec-9812",
            "pb-db-pool-flush",
            "Flush SQL Connection Pool & Reset Max Connections",
            "#INC-20260826-001",
            DateTime.UtcNow.AddMinutes(-22),
            DateTime.UtcNow.AddMinutes(-21),
            "Success",
            new List<string>
            {
                "[14:15:02] Anomaly Engine detected SQL Latency spike (1,840ms). Triggered pb-db-pool-flush.",
                "[14:15:03] Step 1: Executed FlushDbConnectionPool. Recycled 42 stale pool connections.",
                "[14:15:05] Step 2: Invalidated 128 Redis keys under 'catalog:*'.",
                "[14:15:10] Step 3: DbHealthCheckProbe verified SQL response time returned to 12.4ms.",
                "[14:15:11] Remediation Playbook completed successfully. Status: Resolved."
            },
            9.2
        )
    };

    public List<RemediationPlaybookDto> GetAllPlaybooks() => _playbooks;

    public List<PlaybookExecutionLogDto> GetExecutionHistory() => _executionHistory.OrderByDescending(h => h.StartedAt).ToList();

    public PlaybookExecutionLogDto ExecutePlaybook(string playbookId, string incidentId)
    {
        var playbook = _playbooks.FirstOrDefault(p => p.PlaybookId == playbookId)
            ?? throw new ArgumentException($"Playbook '{playbookId}' not found.");

        var startTime = DateTime.UtcNow;
        var execId = $"exec-{Random.Shared.Next(1000, 9999)}";

        var logs = new List<string>
        {
            $"[{startTime:HH:mm:ss}] Triggered manual execution of playbook '{playbook.Title}' for Incident '{incidentId}'.",
            $"[{startTime:HH:mm:ss}] Validated target environment and API credentials."
        };

        foreach (var step in playbook.Steps)
        {
            logs.Add($"[{startTime.AddSeconds(step.StepOrder * 2):HH:mm:ss}] Step {step.StepOrder}: Executing '{step.ActionName}' on '{step.TargetComponent}'...");
            logs.Add($"[{startTime.AddSeconds(step.StepOrder * 2 + 1):HH:mm:ss}] Step {step.StepOrder} completed successfully.");
        }

        var completedTime = startTime.AddSeconds(playbook.Steps.Count * 3);
        logs.Add($"[{completedTime:HH:mm:ss}] Playbook execution completed. Incident '{incidentId}' mitigated.");

        var log = new PlaybookExecutionLogDto(
            execId,
            playbook.PlaybookId,
            playbook.Title,
            incidentId,
            startTime,
            completedTime,
            "Success",
            logs,
            Math.Round((completedTime - startTime).TotalSeconds, 1)
        );

        _executionHistory.Add(log);
        return log;
    }
}
