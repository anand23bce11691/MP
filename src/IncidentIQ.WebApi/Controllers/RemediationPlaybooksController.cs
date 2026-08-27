using IncidentIQ.Application.Engine;
using Microsoft.AspNetCore.Mvc;

namespace IncidentIQ.WebApi.Controllers;

public record ExecutePlaybookRequestDto(
    string PlaybookId,
    string IncidentId
);

[ApiController]
[Route("api/remediation")]
public class RemediationPlaybooksController : ControllerBase
{
    private static readonly AutomatedRemediationEngine _remediationEngine = new();

    [HttpGet("playbooks")]
    public IActionResult GetPlaybooks()
    {
        return Ok(_remediationEngine.GetAllPlaybooks());
    }

    [HttpGet("history")]
    public IActionResult GetExecutionHistory()
    {
        return Ok(_remediationEngine.GetExecutionHistory());
    }

    [HttpPost("execute")]
    public IActionResult ExecutePlaybook([FromBody] ExecutePlaybookRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.PlaybookId)) return BadRequest(new { message = "PlaybookId is required." });
        try
        {
            var result = _remediationEngine.ExecutePlaybook(dto.PlaybookId, dto.IncidentId ?? "#INC-MANUAL");
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
