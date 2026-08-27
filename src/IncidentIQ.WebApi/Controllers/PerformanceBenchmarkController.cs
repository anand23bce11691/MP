using IncidentIQ.Application.Engine;
using Microsoft.AspNetCore.Mvc;

namespace IncidentIQ.WebApi.Controllers;

public record RunBenchmarkRequest(
    string ProfileName
);

[ApiController]
[Route("api/benchmark")]
public class PerformanceBenchmarkController : ControllerBase
{
    private static readonly PerformanceBenchmarkEngine _benchmarkEngine = new();

    [HttpGet("history")]
    public IActionResult GetBenchmarkHistory()
    {
        return Ok(_benchmarkEngine.GetBenchmarkHistory());
    }

    [HttpGet("index-health")]
    public IActionResult GetDatabaseIndexHealth()
    {
        return Ok(_benchmarkEngine.AnalyzeDatabaseIndexHealth());
    }

    [HttpPost("run")]
    public IActionResult RunSyntheticBenchmark([FromBody] RunBenchmarkRequest req)
    {
        var profile = string.IsNullOrWhiteSpace(req.ProfileName) ? "Standard_100_RPM" : req.ProfileName;
        var result = _benchmarkEngine.RunSyntheticBenchmark(profile);
        return Ok(result);
    }
}
