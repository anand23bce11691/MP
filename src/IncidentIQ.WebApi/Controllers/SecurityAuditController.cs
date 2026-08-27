using IncidentIQ.Application.Engine;
using Microsoft.AspNetCore.Mvc;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/security")]
public class SecurityAuditController : ControllerBase
{
    private readonly SecurityAuditEngine _engine = new();

    [HttpGet("compliance")]
    public IActionResult GetSecurityCompliance()
    {
        var status = _engine.AuditSecurityPosture();
        return Ok(status);
    }

    [HttpGet("vulnerabilities")]
    public IActionResult GetVulnerabilities()
    {
        var status = _engine.AuditSecurityPosture();
        return Ok(status.Vulnerabilities);
    }

    [HttpPost("scan")]
    public IActionResult TriggerSecurityScan()
    {
        var status = _engine.AuditSecurityPosture();
        return Ok(new
        {
            message = "OWASP vulnerability scan completed.",
            score = status.OverallScorePercent,
            grade = status.ComplianceGrade,
            scanTimestamp = DateTime.UtcNow
        });
    }
}
