using IncidentIQ.Application.Engine;
using Microsoft.AspNetCore.Mvc;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/tracing")]
public class DistributedTracingController : ControllerBase
{
    private readonly DistributedTracingEngine _engine = new();

    [HttpGet("dag")]
    public IActionResult GetTraceDag([FromQuery] string? traceId, [FromQuery] string path = "/api/shopeasy/orders", [FromQuery] double durationMs = 142.5, [FromQuery] int statusCode = 200)
    {
        var dag = _engine.GenerateSampleTraceDag(traceId ?? "tr-demo-102", path, durationMs, statusCode);
        return Ok(dag);
    }

    [HttpGet("spans")]
    public IActionResult GetTraceSpans([FromQuery] string traceId = "tr-demo-102")
    {
        var dag = _engine.GenerateSampleTraceDag(traceId, "/api/shopeasy/orders", 142.5, 200);
        return Ok(dag.Spans);
    }

    [HttpGet("flamegraph")]
    public IActionResult GetFlameGraph([FromQuery] string traceId = "tr-demo-102")
    {
        var dag = _engine.GenerateSampleTraceDag(traceId, "/api/shopeasy/orders", 142.5, 200);
        var flameData = new
        {
            traceId = dag.TraceId,
            totalDurationMs = dag.TotalDurationMs,
            rootNode = new
            {
                name = "ShopEasy Gateway Proxy",
                value = dag.TotalDurationMs,
                children = new object[]
                {
                    new
                    {
                        name = "ShopEasy Core API (Port 5001)",
                        value = dag.TotalDurationMs * 0.85,
                        children = new object[]
                        {
                            new { name = "SQL Server 2022 Query Execution", value = dag.TotalDurationMs * 0.60 },
                            new { name = "Redis L2 Cache Get", value = 3.5 }
                        }
                    }
                }
            }
        };
        return Ok(flameData);
    }
}
