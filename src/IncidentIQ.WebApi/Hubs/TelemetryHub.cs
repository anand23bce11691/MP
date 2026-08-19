using IncidentIQ.Application.Dtos;
using Microsoft.AspNetCore.SignalR;

namespace IncidentIQ.WebApi.Hubs;

public class TelemetryHub : Hub
{
    public async Task SendMetrics(SystemMetricDto metric)
    {
        await Clients.All.SendAsync("MetricsUpdated", metric);
    }

    public async Task SendIncidentAlert(IncidentDto incident)
    {
        await Clients.All.SendAsync("IncidentDetected", incident);
    }

    public async Task SendStatusChange(SimulationStateDto state)
    {
        await Clients.All.SendAsync("StatusChanged", state);
    }
}
