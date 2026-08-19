using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using System.Net.Http.Json;

namespace IncidentIQ.Infrastructure.Middleware;

public class IncidentIQMiddlewareOptions
{
    public string IncidentIQBaseUrl { get; set; } = "http://localhost:5000";
    public string ApiKey { get; set; } = string.Empty;
}

public class IncidentIQMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IncidentIQMiddlewareOptions _options;
    private static readonly HttpClient _httpClient = new HttpClient();

    public IncidentIQMiddleware(RequestDelegate next, IncidentIQMiddlewareOptions options)
    {
        _next = next;
        _options = options;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        int statusCode = 200;
        string? errorMessage = null;

        try
        {
            await _next(context);
            statusCode = context.Response.StatusCode;
        }
        catch (Exception ex)
        {
            statusCode = 500;
            errorMessage = ex.Message;
            throw;
        }
        finally
        {
            sw.Stop();
            var durationMs = sw.ElapsedMilliseconds;

            // Post telemetry asynchronously to IncidentIQ Platform without blocking parent app
            _ = Task.Run(async () =>
            {
                try
                {
                    if (!string.IsNullOrEmpty(_options.ApiKey))
                    {
                        using var req = new HttpRequestMessage(HttpMethod.Post, $"{_options.IncidentIQBaseUrl.TrimEnd('/')}/api/monitoring/ingest");
                        req.Headers.Add("X-IncidentIQ-Key", _options.ApiKey);
                        req.Content = JsonContent.Create(new
                        {
                            eventType = statusCode >= 500 ? "error" : "request",
                            endpoint = context.Request.Path.Value,
                            statusCode = statusCode,
                            durationMs = (double)durationMs,
                            severity = statusCode >= 500 ? "Critical" : "Info",
                            message = errorMessage ?? $"{context.Request.Method} {context.Request.Path} executed in {durationMs}ms",
                            timestamp = DateTime.UtcNow
                        });
                        await _httpClient.SendAsync(req);
                    }
                }
                catch
                {
                    // Fail-safe silent catch to ensure target web application is never affected
                }
            });
        }
    }
}

public static class IncidentIQMiddlewareExtensions
{
    public static IApplicationBuilder UseIncidentIQ(this IApplicationBuilder builder, Action<IncidentIQMiddlewareOptions> configure)
    {
        var options = new IncidentIQMiddlewareOptions();
        configure(options);
        return builder.UseMiddleware<IncidentIQMiddleware>(options);
    }
}
