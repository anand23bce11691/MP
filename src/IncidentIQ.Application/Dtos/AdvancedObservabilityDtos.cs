using System;
using System.Collections.Generic;

namespace IncidentIQ.Application.Dtos;

// Distributed Tracing DTOs
public record TraceSpanDto(
    string SpanId,
    string ParentSpanId,
    string TraceId,
    string ServiceName,
    string OperationName,
    DateTime StartTime,
    double DurationMs,
    int StatusCode,
    bool IsError,
    string? ErrorMessage,
    Dictionary<string, string> Tags,
    List<SpanEventDto> Events
);

public record SpanEventDto(
    DateTime Timestamp,
    string Name,
    string Details
);

public record TraceDagNodeDto(
    string Id,
    string Label,
    string Type, // "Service", "Database", "Cache", "ExternalApi"
    double LatencyMs,
    int ErrorRatePercent,
    int ThroughputRpm,
    string Status // "Healthy", "Warning", "Critical"
);

public record TraceDagEdgeDto(
    string SourceId,
    string TargetId,
    string Protocol, // "HTTP/REST", "gRPC", "SQL/T-SQL", "Redis"
    double CallCountPerMin,
    double AvgLatencyMs
);

public record DistributedTraceDagDto(
    string TraceId,
    string RootService,
    double TotalDurationMs,
    int TotalSpans,
    bool HasError,
    List<TraceDagNodeDto> Nodes,
    List<TraceDagEdgeDto> Edges,
    List<TraceSpanDto> Spans
);

// SRE SLO / SLI & Error Budget DTOs
public record SloDefinitionDto(
    string SloId,
    string Name,
    string TargetService,
    string MetricType, // "Latency", "Availability", "ErrorRate"
    double TargetPercentage, // e.g. 99.9%
    double CurrentPercentage,
    double ErrorBudgetRemainingPercent,
    double BurnRateMultiplier, // e.g. 1.0 = Normal, 14.4 = Emergency
    string HealthStatus, // "Met", "AtRisk", "Breached"
    DateTime EvaluatedAt
);

public record ErrorBudgetBurnDataPoint(
    DateTime Timestamp,
    double RemainingBudgetPercent,
    double BurnRate,
    double LatencyP95Ms,
    double LatencyP99Ms
);

public record SloAnalyticsSummaryDto(
    int TotalSlos,
    int HealthySlos,
    int AtRiskSlos,
    int BreachedSlos,
    double OverallAvailability,
    List<SloDefinitionDto> Slos,
    List<ErrorBudgetBurnDataPoint> BurnHistory
);

// Auto-Remediation Playbook DTOs
public record RemediationPlaybookDto(
    string PlaybookId,
    string Title,
    string TargetIncidentType, // "ApiFailure", "DatabaseSlowdown", "MemoryLeak", "CpuSpike"
    string Description,
    bool IsAutomated,
    string ExecutionMode, // "Automatic", "ManualApproval", "DryRun"
    List<PlaybookStepDto> Steps,
    int SuccessRatePercentage,
    int ExecutionCount,
    DateTime? LastExecutedAt
);

public record PlaybookStepDto(
    int StepOrder,
    string ActionName, // "RestartPod", "FlushRedisCache", "ScaleReplicas", "ToggleRateLimiter"
    string TargetComponent,
    string ParameterJson,
    int TimeoutSeconds
);

public record PlaybookExecutionLogDto(
    string ExecutionId,
    string PlaybookId,
    string PlaybookTitle,
    string TriggeredByIncidentId,
    DateTime StartedAt,
    DateTime CompletedAt,
    string Status, // "Success", "Failed", "In_Progress", "Rolled_Back"
    List<string> OutputLogs,
    double DurationSeconds
);

// Predictive Forecasting DTOs
public record ForecastDataPointDto(
    DateTime Timestamp,
    double PredictedValue,
    double UpperConfidenceBound,
    double LowerConfidenceBound,
    bool IsAnomalyPredicted
);

public record PredictiveAnomalyReportDto(
    string MetricName,
    string TargetService,
    double CurrentValue,
    double ForecastedValueIn30Min,
    string TrendDirection, // "UpwardSpike", "Stable", "Downward"
    double AnomalyProbability,
    string AlertRecommendation,
    List<ForecastDataPointDto> ForecastSeries
);

// Executive Post-Mortem Report DTOs
public record PostMortemReportDto(
    string ReportId,
    string IncidentId,
    string IncidentTitle,
    string Severity,
    DateTime DetectedAt,
    DateTime ResolvedAt,
    double TotalDowntimeMinutes,
    double EstimatedSlaImpactPercentage,
    string ExecutiveSummary,
    string RootCauseAnalysis,
    List<string> ContributingFactors,
    List<string> ActionItems,
    List<PostMortemTimelineEventDto> Timeline
);

public record PostMortemTimelineEventDto(
    DateTime Timestamp,
    string Actor, // "IncidentIQ AI", "SRE On-Call", "Automated Remediation"
    string EventDescription,
    string Category // "Detection", "Mitigation", "Diagnosis", "Resolution"
);
