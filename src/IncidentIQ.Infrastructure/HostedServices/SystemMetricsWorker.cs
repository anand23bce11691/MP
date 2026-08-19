using System.Diagnostics;
using IncidentIQ.Application.Dtos;
using IncidentIQ.Application.Interfaces;
using IncidentIQ.Domain.Entities;
using IncidentIQ.Infrastructure.Data;
using IncidentIQ.Infrastructure.Interceptors;
using IncidentIQ.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace IncidentIQ.Infrastructure.HostedServices;

public class SystemMetricsWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IAnomalyDetectionEngine _anomalyEngine;
    private readonly IFailureSimulationManager _simulationManager;
    private readonly ILogger<SystemMetricsWorker> _logger;

    // Func delegate injected from WebApi for SignalR broadcast
    public static Func<SystemMetricDto, Task>? OnMetricsCollected;
    public static Func<IncidentDto, Task>? OnIncidentAlert;

    public SystemMetricsWorker(
        IServiceProvider serviceProvider,
        IAnomalyDetectionEngine anomalyEngine,
        IFailureSimulationManager simulationManager,
        ILogger<SystemMetricsWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _anomalyEngine = anomalyEngine;
        _simulationManager = simulationManager;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var (avgApiLatency, reqCount, errCount) = TelemetryCollectorMiddleware.GetSnapshotAndReset();
                var sqlLatency = EfQueryInterceptor.GetAverageSqlLatencyMs();

                var state = _simulationManager.GetState();

                // Inject latency multiplier if chaos active
                if (state.IsDbSlowdownActive || state.IsCascadingFailureActive)
                {
                    sqlLatency = Math.Max(sqlLatency, state.DbDelayMs + Random.Shared.Next(50, 200));
                    avgApiLatency = Math.Max(avgApiLatency, sqlLatency + Random.Shared.Next(100, 300));
                }

                if (state.IsApiFailureActive)
                {
                    errCount = Math.Max(errCount, Random.Shared.Next(30, 50));
                }

                var requestsPerMin = state.IsTrafficSpikeActive || state.IsCascadingFailureActive
                    ? Random.Shared.Next(2800, 3200)
                    : Math.Max(reqCount * 60, Random.Shared.Next(90, 110));

                var cpu = state.IsTrafficSpikeActive || state.IsCascadingFailureActive
                    ? Random.Shared.NextDouble() * 15 + 85.0
                    : Random.Shared.NextDouble() * 15 + 25.0;

                var memory = Random.Shared.NextDouble() * 10 + 40.0;
                var dbConnections = state.IsDbSlowdownActive || state.IsCascadingFailureActive
                    ? Random.Shared.Next(40, 60)
                    : Random.Shared.Next(5, 15);

                var metric = new SystemMetric
                {
                    Timestamp = DateTime.UtcNow,
                    ApiLatencyMs = Math.Round(avgApiLatency, 1),
                    SqlLatencyMs = Math.Round(sqlLatency, 1),
                    RequestsPerMin = requestsPerMin,
                    ErrorCountPerMin = errCount,
                    CpuUsagePercentage = Math.Round(cpu, 1),
                    MemoryUsagePercentage = Math.Round(memory, 1),
                    ActiveDbConnections = dbConnections
                };

                // Persist metric to DB in scope
                using (var scope = _serviceProvider.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    db.SystemMetrics.Add(metric);
                    await db.SaveChangesAsync(stoppingToken);
                }

                // Process anomaly detection loop
                await _anomalyEngine.ProcessTelemetryWindowAsync(metric, stoppingToken);

                // Broadcast metrics via SignalR callback
                if (OnMetricsCollected != null)
                {
                    var dto = new SystemMetricDto(
                        metric.Timestamp,
                        metric.ApiLatencyMs,
                        metric.SqlLatencyMs,
                        metric.RequestsPerMin,
                        metric.ErrorCountPerMin,
                        metric.CpuUsagePercentage,
                        metric.MemoryUsagePercentage,
                        metric.ActiveDbConnections
                    );
                    await OnMetricsCollected.Invoke(dto);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SystemMetricsWorker cycle");
            }

            await Task.Delay(1000, stoppingToken);
        }
    }
}
