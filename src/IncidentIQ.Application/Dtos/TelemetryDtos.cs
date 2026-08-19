namespace IncidentIQ.Application.Dtos;

public record SystemMetricDto(
    DateTime Timestamp,
    double ApiLatencyMs,
    double SqlLatencyMs,
    int RequestsPerMin,
    int ErrorCountPerMin,
    double CpuUsagePercentage,
    double MemoryUsagePercentage,
    int ActiveDbConnections
);

public record ApplicationLogDto(
    long LogId,
    DateTime Timestamp,
    string RequestMethod,
    string RequestPath,
    int StatusCode,
    double ResponseTimeMs,
    double SqlTimeMs,
    string? ErrorMessage
);
