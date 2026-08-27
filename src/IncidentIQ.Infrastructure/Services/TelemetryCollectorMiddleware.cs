using System.Diagnostics;
using IncidentIQ.Application.Interfaces;
using IncidentIQ.Domain.Entities;
using IncidentIQ.Infrastructure.Interceptors;
using Microsoft.AspNetCore.Http;

namespace IncidentIQ.Infrastructure.Services;

public class TelemetryCollectorMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly List<ApplicationLog> _recentLogs = new();
    private static readonly object _lock = new();

    public TelemetryCollectorMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public static List<ApplicationLog> GetRecentLogs()
    {
        lock (_lock)
        {
            return _recentLogs.OrderByDescending(l => l.Timestamp).ToList();
        }
    }

    public static (double avgApiLatencyMs, int requestCount, int errorCount) GetSnapshotAndReset()
    {
        lock (_lock)
        {
            if (_recentLogs.Count == 0) return (42.0, 185, 0);

            var avgApiLatency = _recentLogs.Average(l => l.ResponseTimeMs);
            var reqCount = _recentLogs.Count;
            var errCount = _recentLogs.Count(l => l.StatusCode >= 500);

            return (avgApiLatency, reqCount, errCount);
        }
    }

    public async Task InvokeAsync(HttpContext context, IFailureSimulationManager simulationManager)
    {
        var sw = Stopwatch.StartNew();
        var path = context.Request.Path.Value ?? "";
        var method = context.Request.Method;

        // Skip static asset logging & CORS OPTIONS preflight to keep telemetry log stream clean
        if (method == "OPTIONS" || path.StartsWith("/assets") || path.EndsWith(".js") || path.EndsWith(".css") || path.EndsWith(".png") || path.EndsWith(".svg") || path.EndsWith(".ico"))
        {
            await _next(context);
            return;
        }

        var state = simulationManager.GetState();

        // Failure Injection: API Payment Failure
        if (state.IsApiFailureActive && path.Contains("/api/payments", StringComparison.OrdinalIgnoreCase) && method == "POST")
        {
            var rand = Random.Shared.NextDouble();
            if (rand <= state.ApiFailureRate)
            {
                sw.Stop();
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync("Simulated Payment Gateway Error (500)");
                
                RecordLog(method, path, 500, sw.Elapsed.TotalMilliseconds, 45.0, "Simulated Payment Gateway Error (500)");
                return;
            }
        }

        string? errorMessage = null;
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            errorMessage = ex.Message;
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            throw;
        }
        finally
        {
            sw.Stop();
            var statusCode = context.Response.StatusCode;
            var sqlTime = EfQueryInterceptor.GetAverageSqlLatencyMs();

            RecordLog(method, path, statusCode, sw.Elapsed.TotalMilliseconds, sqlTime, errorMessage);
        }
    }

    public static void RecordLog(string method, string path, int statusCode, double responseMs, double sqlMs, string? error)
    {
        lock (_lock)
        {
            _recentLogs.Add(new ApplicationLog
            {
                LogId = _recentLogs.Count + 1,
                Timestamp = DateTime.UtcNow,
                RequestMethod = method,
                RequestPath = path,
                StatusCode = statusCode,
                ResponseTimeMs = responseMs,
                SqlTimeMs = sqlMs,
                ErrorMessage = error
            });

            if (_recentLogs.Count > 500)
            {
                _recentLogs.RemoveAt(0);
            }
        }
    }
}
