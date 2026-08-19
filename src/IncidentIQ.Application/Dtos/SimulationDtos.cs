namespace IncidentIQ.Application.Dtos;

public record SimulationStateDto(
    bool IsDbSlowdownActive,
    int DbDelayMs,
    bool IsApiFailureActive,
    double ApiFailureRate,
    bool IsTrafficSpikeActive,
    bool IsCascadingFailureActive,
    string TrafficMode
);

public record SimulationCommandDto(
    string Action, // "DbSlowdown", "ApiFailure", "TrafficSpike", "CascadingFailure", "Reset"
    bool Enable = true,
    int ParamInt = 1500,
    double ParamDouble = 0.8,
    string TrafficMode = "Normal"
);
