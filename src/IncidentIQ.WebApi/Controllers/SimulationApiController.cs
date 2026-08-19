using IncidentIQ.Application.Dtos;
using IncidentIQ.Application.Interfaces;
using IncidentIQ.WebApi.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/simulation")]
public class SimulationApiController : ControllerBase
{
    private readonly IFailureSimulationManager _simulationManager;
    private readonly ITrafficSimulatorService _trafficSimulator;
    private readonly IHubContext<TelemetryHub> _hubContext;

    public SimulationApiController(
        IFailureSimulationManager simulationManager,
        ITrafficSimulatorService trafficSimulator,
        IHubContext<TelemetryHub> hubContext)
    {
        _simulationManager = simulationManager;
        _trafficSimulator = trafficSimulator;
        _hubContext = hubContext;
    }

    [HttpGet("state")]
    public IActionResult GetState()
    {
        var state = _simulationManager.GetState();
        return Ok(state);
    }

    [HttpPost("command")]
    public async Task<IActionResult> ExecuteCommand([FromBody] SimulationCommandDto cmd)
    {
        switch (cmd.Action.ToLowerInvariant())
        {
            case "dbslowdown":
                _simulationManager.SetDbSlowdown(cmd.Enable, cmd.ParamInt);
                break;
            case "apifailure":
                _simulationManager.SetApiFailure(cmd.Enable, cmd.ParamDouble);
                break;
            case "trafficspike":
                _simulationManager.SetTrafficSpike(cmd.Enable);
                break;
            case "cascadingfailure":
                _simulationManager.SetCascadingFailure(cmd.Enable);
                break;
            case "trafficmode":
                _trafficSimulator.SetMode(cmd.TrafficMode);
                break;
            case "reset":
            default:
                _simulationManager.ResetAll();
                _trafficSimulator.SetMode("Normal");
                break;
        }

        var newState = _simulationManager.GetState();
        await _hubContext.Clients.All.SendAsync("StatusChanged", newState);

        return Ok(newState);
    }

    [HttpPost("toggle-dbslowdown")]
    public async Task<IActionResult> ToggleDbSlowdown()
    {
        var currentState = _simulationManager.GetState();
        _simulationManager.SetDbSlowdown(!currentState.IsDbSlowdownActive);
        var newState = _simulationManager.GetState();
        await _hubContext.Clients.All.SendAsync("StatusChanged", newState);
        return Ok(newState);
    }

    [HttpPost("toggle-trafficspike")]
    public async Task<IActionResult> ToggleTrafficSpike()
    {
        var currentState = _simulationManager.GetState();
        _simulationManager.SetTrafficSpike(!currentState.IsTrafficSpikeActive);
        var newState = _simulationManager.GetState();
        await _hubContext.Clients.All.SendAsync("StatusChanged", newState);
        return Ok(newState);
    }

    [HttpPost("toggle-apifailure")]
    public async Task<IActionResult> ToggleApiFailure()
    {
        var currentState = _simulationManager.GetState();
        _simulationManager.SetApiFailure(!currentState.IsApiFailureActive);
        var newState = _simulationManager.GetState();
        await _hubContext.Clients.All.SendAsync("StatusChanged", newState);
        return Ok(newState);
    }

    [HttpPost("toggle-cascadingfailure")]
    public async Task<IActionResult> ToggleCascadingFailure()
    {
        var currentState = _simulationManager.GetState();
        _simulationManager.SetCascadingFailure(!currentState.IsCascadingFailureActive);
        var newState = _simulationManager.GetState();
        await _hubContext.Clients.All.SendAsync("StatusChanged", newState);
        return Ok(newState);
    }
}
