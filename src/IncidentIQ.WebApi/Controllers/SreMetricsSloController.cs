using IncidentIQ.Application.Engine;
using Microsoft.AspNetCore.Mvc;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/sre")]
public class SreMetricsSloController : ControllerBase
{
    private readonly PredictiveAnomalyModel _model = new();

    [HttpGet("slo")]
    public IActionResult GetSloSummary()
    {
        var summary = _model.EvaluateSloStatus();
        return Ok(summary);
    }

    [HttpGet("forecast")]
    public IActionResult GetMetricForecast([FromQuery] string metricName = "Latency", [FromQuery] string targetService = "ShopEasy Core API (Port 5001)")
    {
        var report = _model.GenerateForecast(metricName, targetService);
        return Ok(report);
    }
}
