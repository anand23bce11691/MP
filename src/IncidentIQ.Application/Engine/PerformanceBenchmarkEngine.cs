using System;
using System.Collections.Generic;
using System.Linq;
using IncidentIQ.Application.Dtos;

namespace IncidentIQ.Application.Engine;

public class PerformanceBenchmarkEngine
{
    private static readonly List<BenchmarkResultDto> _history = new()
    {
        new BenchmarkResultDto(
            "bench-9012",
            "Peak_1000_RPM",
            DateTime.UtcNow.AddMinutes(-30),
            60.0,
            1000,
            994,
            6,
            16.6,
            14.2,
            38.5,
            42.0,
            88.4,
            145.0,
            58.2,
            52.0,
            "Completed"
        )
    };

    public BenchmarkResultDto RunSyntheticBenchmark(string profileName)
    {
        int targetRequests = profileName switch
        {
            "Stress_3000_RPM" => 3000,
            "Peak_1000_RPM" => 1000,
            _ => 300
        };

        var rand = Random.Shared;
        int failed = profileName == "Stress_3000_RPM" ? rand.Next(15, 45) : rand.Next(0, 3);
        int success = targetRequests - failed;

        double baseMs = profileName == "Stress_3000_RPM" ? 140.0 : 25.0;

        var result = new BenchmarkResultDto(
            $"bench-{rand.Next(1000, 9999)}",
            profileName,
            DateTime.UtcNow,
            30.0,
            targetRequests,
            success,
            failed,
            Math.Round(targetRequests / 30.0, 1),
            Math.Round(baseMs, 1),
            Math.Round(baseMs * 1.8, 1),
            Math.Round(baseMs * 2.2, 1),
            Math.Round(baseMs * 3.5, 1),
            Math.Round(baseMs * 5.8, 1),
            profileName == "Stress_3000_RPM" ? 92.4 : 44.5,
            54.0,
            "Completed"
        );

        _history.Add(result);
        return result;
    }

    public List<BenchmarkResultDto> GetBenchmarkHistory() => _history.OrderByDescending(b => b.StartedAt).ToList();

    public List<SqlIndexHealthDto> AnalyzeDatabaseIndexHealth()
    {
        return new List<SqlIndexHealthDto>
        {
            new("Orders", "PK_Orders_OrderId", 2.4, 184, "OPTIMAL", DateTime.UtcNow),
            new("OrderItems", "IX_OrderItems_ProductId", 18.5, 412, "REORGANIZE", DateTime.UtcNow),
            new("ApplicationLogs", "IX_ApplicationLogs_Timestamp", 34.8, 1850, "REBUILD", DateTime.UtcNow),
            new("Products", "PK_Products_ProductId", 0.8, 48, "OPTIMAL", DateTime.UtcNow)
        };
    }
}
