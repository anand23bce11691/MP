namespace IncidentIQ.Application.Dtos;

public record RegisterApplicationDto(string Name, string BaseUrl);
public record CreateEndpointDto(string Name, string Url, string Method = "GET", int ExpectedStatusCode = 200, int CheckIntervalSeconds = 30);
public record TelemetryIngestDto(string EventType, string? Endpoint, int? StatusCode, double? DurationMs, string? Severity, string? Message, DateTime? Timestamp);
public record ApplicationSummaryDto(int Id, string Name, string BaseUrl, bool IsActive, DateTime? LastSeenAt, int EndpointCount, int OpenIncidentCount);
