using IncidentIQ.Domain.Entities;
using IncidentIQ.Infrastructure.Data;
using IncidentIQ.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace IncidentIQ.Infrastructure.HostedServices;

public class EndpointProbeService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<EndpointProbeService> _logger;

    public EndpointProbeService(IServiceProvider services, IHttpClientFactory httpClientFactory, ILogger<EndpointProbeService> logger)
    {
        _services = services;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var endpoints = await db.MonitoredEndpoints.Include(e => e.MonitoredApplication)
                    .Where(e => e.IsActive && e.MonitoredApplication!.IsActive)
                    .ToListAsync(stoppingToken);
                var ingestion = scope.ServiceProvider.GetRequiredService<TelemetryIngestionService>();

                foreach (var endpoint in endpoints.Where(e => !e.LastCheckedAt.HasValue || e.LastCheckedAt <= DateTime.UtcNow.AddSeconds(-e.CheckIntervalSeconds)))
                {
                    var timer = Stopwatch.StartNew();
                    int? status = null;
                    string? message = null;
                    try
                    {
                        using var request = new HttpRequestMessage(new HttpMethod(endpoint.Method), endpoint.Url);
                        using var response = await _httpClientFactory.CreateClient("probe").SendAsync(request, stoppingToken);
                        status = (int)response.StatusCode;
                        if (status != endpoint.ExpectedStatusCode) message = $"Expected HTTP {endpoint.ExpectedStatusCode}; received HTTP {status}.";
                    }
                    catch (Exception ex)
                    {
                        status = 503;
                        message = $"Probe failed: {ex.Message}";
                    }
                    finally
                    {
                        timer.Stop();
                    }

                    endpoint.LastCheckedAt = DateTime.UtcNow;
                    await ingestion.RecordAsync(new TelemetryEvent
                    {
                        MonitoredApplicationId = endpoint.MonitoredApplicationId,
                        EventType = "probe",
                        Source = "IncidentIQ probe",
                        Endpoint = endpoint.Url,
                        StatusCode = status,
                        DurationMs = timer.Elapsed.TotalMilliseconds,
                        Severity = status >= 500 || timer.Elapsed.TotalMilliseconds >= 1500 ? "Error" : "Info",
                        Message = message,
                        Timestamp = DateTime.UtcNow
                    }, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Endpoint probe cycle failed");
            }
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
}
