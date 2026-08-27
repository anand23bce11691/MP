using System;
using System.Collections.Generic;
using System.Linq;
using IncidentIQ.Application.Dtos;

namespace IncidentIQ.Application.Engine;

public class SecurityAuditEngine
{
    private static readonly List<VulnerabilityItemDto> _vulnerabilities = new()
    {
        new VulnerabilityItemDto(
            "vuln-sql-01",
            "Potential Unparameterized SQL Query Detected in Legacy Probe",
            "SQL_Injection",
            "High",
            "TelemetryCollectorMiddleware -> EfQueryInterceptor",
            "Dynamic SQL query concatenation was detected in legacy telemetry search probe. Parameterized SqlCommand bindings are enforced in primary AppDbContext.",
            "Replace raw string formatting in ExecuteSqlRaw calls with SqlParameter object array bindings.",
            DateTime.UtcNow.AddHours(-3),
            "Open"
        ),
        new VulnerabilityItemDto(
            "vuln-cors-02",
            "Permissive CORS Wildcard Policy ('*') Enabled for Endpoint",
            "CORS_Misconfig",
            "Medium",
            "IncidentIQ.WebApi -> Program.cs (AllowAll)",
            "The API engine allows requests from any origin ('*') to facilitate standalone ShopEasy App on Port 5001 communication.",
            "In production deployment, restrict Access-Control-Allow-Origin to explicit domain whitelist ['http://localhost:5001', 'https://shopeasy.com'].",
            DateTime.UtcNow.AddDays(-1),
            "Mitigated"
        ),
        new VulnerabilityItemDto(
            "vuln-pii-03",
            "Customer Email Plaintext Exposure in Log Telemetry Stream",
            "PII_Leakage",
            "Medium",
            "ShopEasy Context -> sendTelemetryToIncidentIQ",
            "User email addresses were passed in plaintext query parameters during order placement telemetry dispatches.",
            "Mask email parameters using SHA-256 hash or redact domain names in TelemetryIngestionController.",
            DateTime.UtcNow.AddMinutes(-45),
            "Open"
        ),
        new VulnerabilityItemDto(
            "vuln-jwt-04",
            "Missing Token Signature Algorithm Pinning (HS256 vs RS256)",
            "JWT_Weakness",
            "Low",
            "Authentication Endpoint -> Bearer Handler",
            "JWT token validation accepts both symmetric HS256 and asymmetric RS256 without algorithm pinning.",
            "Explicitly configure ValidAlgorithms = [SecurityAlgorithms.HmacSha256] in TokenValidationParameters.",
            DateTime.UtcNow.AddDays(-2),
            "Open"
        )
    };

    public SecurityComplianceStatusDto AuditSecurityPosture()
    {
        var openVulns = _vulnerabilities.Where(v => v.Status == "Open").ToList();
        int score = Math.Max(0, 100 - (openVulns.Count * 12));

        string grade = score >= 95 ? "A+" : (score >= 85 ? "A" : (score >= 70 ? "B" : "C"));

        return new SecurityComplianceStatusDto(
            score,
            grade,
            _vulnerabilities.Count,
            openVulns.Count(v => v.Severity == "Critical"),
            openVulns.Count(v => v.Severity == "High"),
            openVulns.Count(v => v.Severity == "Medium"),
            score >= 80,
            score >= 85,
            score >= 90,
            _vulnerabilities,
            DateTime.UtcNow
        );
    }
}
