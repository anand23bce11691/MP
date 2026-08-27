using System.Text;
using IncidentIQ.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/reports")]
public class ExportReportController : ControllerBase
{
    [HttpGet("post-mortem/{incidentId}")]
    public IActionResult GeneratePostMortemReport(string incidentId)
    {
        var now = DateTime.UtcNow;
        var report = new PostMortemReportDto(
            $"pm-{Guid.NewGuid():N}".Substring(0, 8),
            incidentId,
            "SQL Lock Escalation & Order Placement Timeout Cascade",
            "High",
            now.AddMinutes(-45),
            now.AddMinutes(-15),
            30.0,
            0.02,
            "During high-volume checkout, an unindexed foreign key lookup caused SQL Server transaction lock escalation on table 'Orders', resulting in request queue timeouts on ShopEasy Core API.",
            "Root cause traced to lack of non-clustered index on OrderItems.ProductId and connection pool exhaustion under 2,000 RPM traffic spike.",
            new List<string>
            {
                "High concurrency write transactions on single database node",
                "Default 30s command timeout exceeded on EF Core context",
                "Lack of fallback circuit breaker on payment gateway payload"
            },
            new List<string>
            {
                "Added Non-Clustered Index on OrderItems.ProductId and User.Email",
                "Enabled Automated Remediation Playbook pb-db-pool-flush",
                "Configured Redis cache warm-up script for catalog endpoints"
            },
            new List<PostMortemTimelineEventDto>
            {
                new(now.AddMinutes(-45), "IncidentIQ Anomaly Engine", "Detected P95 latency anomaly (> 1,800ms) on POST /api/shopeasy/orders", "Detection"),
                new(now.AddMinutes(-42), "IncidentIQ Gemini AI Advisor", "Generated automated root-cause analysis: SQL lock escalation detected", "Diagnosis"),
                new(now.AddMinutes(-35), "Automated Remediation", "Triggered pb-db-pool-flush playbook. Recycled 42 connection pools", "Mitigation"),
                new(now.AddMinutes(-15), "SRE On-Call Engineer", "Verified database latency returned to nominal < 15ms. Resolved incident", "Resolution")
            }
        );

        return Ok(report);
    }

    [HttpGet("export/csv")]
    public IActionResult ExportTelemetryCsv()
    {
        var csv = new StringBuilder();
        csv.AppendLine("Timestamp,Service,RequestMethod,RequestPath,StatusCode,ResponseTimeMs,SqlTimeMs,TraceId");
        csv.AppendLine($"{DateTime.UtcNow:o},ShopEasy Core API,POST,/api/shopeasy/orders,200,42.0,8.0,tr-8f9a2b");
        csv.AppendLine($"{DateTime.UtcNow.AddSeconds(-2):o},ShopEasy Core API,GET,/api/shopeasy/products,200,18.0,4.0,tr-1d99e0");
        csv.AppendLine($"{DateTime.UtcNow.AddSeconds(-4):o},IncidentIQ Engine,POST,/api/telemetry/ingest,200,15.0,3.0,tr-4c71ef");

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"incidentiq-telemetry-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
    }
}
