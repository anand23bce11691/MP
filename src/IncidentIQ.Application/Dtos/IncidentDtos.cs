using IncidentIQ.Domain.Enums;

namespace IncidentIQ.Application.Dtos;

public record IncidentDto(
    int IncidentId,
    string IncidentNumber,
    string Title,
    IncidentType IncidentType,
    SeverityLevel Severity,
    IncidentStatus Status,
    DateTime DetectedAt,
    DateTime? ResolvedAt,
    double ConfidencePercentage,
    string RootCauseSummary,
    string RecommendedAction,
    List<IncidentEvidenceDto> Evidences
);

public record IncidentEvidenceDto(
    int SequenceOrder,
    DateTime Timestamp,
    string MetricName,
    string ObservedValue,
    string BaselineValue,
    string Description
);
