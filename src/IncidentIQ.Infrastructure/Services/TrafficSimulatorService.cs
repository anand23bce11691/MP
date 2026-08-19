using System.Net.Http.Json;
using IncidentIQ.Application.Dtos;
using IncidentIQ.Application.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace IncidentIQ.Infrastructure.Services;

public class TrafficSimulatorService : BackgroundService, ITrafficSimulatorService
{
    private readonly IFailureSimulationManager _simulationManager;
    private readonly ILogger<TrafficSimulatorService> _logger;
    private string _mode = "Normal"; // Normal (100 RPM), High (1000 RPM), Extreme (3000 RPM)
    private readonly HttpClient _httpClient = new();

    public TrafficSimulatorService(IFailureSimulationManager simulationManager, ILogger<TrafficSimulatorService> logger)
    {
        _simulationManager = simulationManager;
        _logger = logger;
    }

    public string CurrentMode => _mode;

    public void SetMode(string mode)
    {
        _mode = mode;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Wait for WebApi server startup
        await Task.Delay(3000, stoppingToken);
        var baseUrl = "http://localhost:5000";

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var state = _simulationManager.GetState();
                var activeMode = state.IsTrafficSpikeActive || state.IsCascadingFailureActive ? "Extreme" : _mode;

                int delayMs = activeMode switch
                {
                    "Extreme" => 20,   // ~3000 RPM
                    "High" => 60,      // ~1000 RPM
                    _ => 600           // ~100 RPM
                };

                // Execute random user flow
                await ExecuteRandomUserFlowAsync(baseUrl, stoppingToken);

                await Task.Delay(delayMs, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Traffic simulator iteration error");
                await Task.Delay(1000, stoppingToken);
            }
        }
    }

    private async Task ExecuteRandomUserFlowAsync(string baseUrl, CancellationToken ct)
    {
        try
        {
            var rand = Random.Shared.Next(1, 100);

            if (rand <= 50)
            {
                // GET Products
                await _httpClient.GetAsync($"{baseUrl}/api/products", ct);
            }
            else if (rand <= 80)
            {
                // GET Product Details
                var productId = Random.Shared.Next(1, 50);
                await _httpClient.GetAsync($"{baseUrl}/api/products/{productId}", ct);
            }
            else
            {
                // POST Order & Payment
                var userId = Random.Shared.Next(1, 10);
                var productId = Random.Shared.Next(1, 50);

                var orderReq = new CreateOrderDto(userId, new List<OrderItemRequestDto>
                {
                    new(productId, 2)
                });

                var orderResp = await _httpClient.PostAsJsonAsync($"{baseUrl}/api/orders", orderReq, ct);
                if (orderResp.IsSuccessStatusCode)
                {
                    var order = await orderResp.Content.ReadFromJsonAsync<OrderResponseDto>(cancellationToken: ct);
                    if (order != null)
                    {
                        var payReq = new ProcessPaymentDto(order.OrderId, order.TotalAmount);
                        await _httpClient.PostAsJsonAsync($"{baseUrl}/api/payments", payReq, ct);
                    }
                }
            }
        }
        catch
        {
            // Ignore connection errors during startup/shutdown
        }
    }
}
