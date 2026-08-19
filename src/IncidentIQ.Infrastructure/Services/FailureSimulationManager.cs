using IncidentIQ.Application.Dtos;
using IncidentIQ.Application.Interfaces;

namespace IncidentIQ.Infrastructure.Services;

public class FailureSimulationManager : IFailureSimulationManager
{
    private bool _isDbSlowdownActive;
    private int _dbDelayMs = 1500;
    private bool _isApiFailureActive;
    private double _apiFailureRate = 0.8;
    private bool _isTrafficSpikeActive;
    private bool _isCascadingFailureActive;
    private string _trafficMode = "Normal";

    private readonly object _lock = new();

    public SimulationStateDto GetState()
    {
        lock (_lock)
        {
            return new SimulationStateDto(
                _isDbSlowdownActive,
                _dbDelayMs,
                _isApiFailureActive,
                _apiFailureRate,
                _isTrafficSpikeActive,
                _isCascadingFailureActive,
                _trafficMode
            );
        }
    }

    public void SetDbSlowdown(bool active, int delayMs = 1500)
    {
        lock (_lock)
        {
            _isDbSlowdownActive = active;
            _dbDelayMs = delayMs;
        }
    }

    public void SetApiFailure(bool active, double failureRate = 0.8)
    {
        lock (_lock)
        {
            _isApiFailureActive = active;
            _apiFailureRate = failureRate;
        }
    }

    public void SetTrafficSpike(bool active)
    {
        lock (_lock)
        {
            _isTrafficSpikeActive = active;
            _trafficMode = active ? "Extreme" : "Normal";
        }
    }

    public void SetCascadingFailure(bool active)
    {
        lock (_lock)
        {
            _isCascadingFailureActive = active;
            _isDbSlowdownActive = active;
            _dbDelayMs = active ? 2000 : 1500;
            _isApiFailureActive = active;
            _apiFailureRate = active ? 0.9 : 0.8;
            _isTrafficSpikeActive = active;
            _trafficMode = active ? "Extreme" : "Normal";
        }
    }

    public void ResetAll()
    {
        lock (_lock)
        {
            _isDbSlowdownActive = false;
            _dbDelayMs = 1500;
            _isApiFailureActive = false;
            _apiFailureRate = 0.8;
            _isTrafficSpikeActive = false;
            _isCascadingFailureActive = false;
            _trafficMode = "Normal";
        }
    }
}
