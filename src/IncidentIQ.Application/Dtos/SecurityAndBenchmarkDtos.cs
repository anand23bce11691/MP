using System;
using System.Collections.Generic;

namespace IncidentIQ.Application.Dtos;

// Security Audit & Vulnerability DTOs
public record VulnerabilityItemDto(
    string VulnerabilityId,
    string Title,
    string Category, // "OWASP_Top_10", "SQL_Injection", "PII_Leakage", "CORS_Misconfig", "JWT_Weakness"
    string Severity, // "Critical", "High", "Medium", "Low"
    string AffectedTarget,
    string Description,
    string RemediationSteps,
    DateTime DetectedAt,
    string Status // "Open", "Mitigated", "Ignored"
);

public record SecurityComplianceStatusDto(
    int OverallScorePercent,
    string ComplianceGrade, // "A+", "A", "B", "C", "F"
    int TotalVulnerabilities,
    int CriticalCount,
    int HighCount,
    int MediumCount,
    bool Soc2Compliant,
    bool Iso27001Compliant,
    bool PciDssCompliant,
    List<VulnerabilityItemDto> Vulnerabilities,
    DateTime LastScannedAt
);

// Performance Benchmark DTOs
public record BenchmarkResultDto(
    string RunId,
    string ProfileName, // "Standard_100_RPM", "Peak_1000_RPM", "Stress_3000_RPM"
    DateTime StartedAt,
    double DurationSeconds,
    int TotalRequests,
    int SuccessfulRequests,
    int FailedRequests,
    double RequestsPerSecond,
    double P50LatencyMs,
    double P90LatencyMs,
    double P95LatencyMs,
    double P99LatencyMs,
    double P999LatencyMs,
    double CpuMaxPercent,
    double MemoryMaxPercent,
    string Status
);

public record SqlIndexHealthDto(
    string TableName,
    string IndexName,
    double FragmentationPercent,
    long PageCount,
    string Recommendation, // "REBUILD", "REORGANIZE", "OPTIMAL"
    DateTime LastAnalyzedAt
);
