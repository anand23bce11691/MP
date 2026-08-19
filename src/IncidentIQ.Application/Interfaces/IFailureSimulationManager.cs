using IncidentIQ.Application.Dtos;

namespace IncidentIQ.Application.Interfaces;

public interface IFailureSimulationManager
{
    SimulationStateDto GetState();
    void SetDbSlowdown(bool active, int delayMs = 1500);
    void SetApiFailure(bool active, double failureRate = 0.8);
    void SetTrafficSpike(bool active);
    void SetCascadingFailure(bool active);
    void ResetAll();
}
