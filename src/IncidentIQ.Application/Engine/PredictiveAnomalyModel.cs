using System;
using System.Collections.Generic;
using System.Linq;
using IncidentIQ.Application.Dtos;

namespace IncidentIQ.Application.Engine;

public class PredictiveAnomalyModel
{
    private static readonly Random _rand = new();

    public PredictiveAnomalyReportDto GenerateForecast(string metricName, string targetService)
    {
        double currentValue = metricName switch
        {
            "CPU" => 48.5,
            "Memory" => 68.2,
            "Latency" => 45.0,
            _ => 185.0
        };

        var series = new List<ForecastDataPointDto>();
        var now = DateTime.UtcNow;

        double trend = _rand.NextDouble() * 1.5 + 0.5;
        double currentForecast = currentValue;

        for (int i = 0; i < 30; i++)
        {
            var time = now.AddMinutes(i * 2);
            double noise = (_rand.NextDouble() - 0.48) * 4.0;
            currentForecast += trend + noise;

            double upperBound = currentForecast + (i * 0.4) + 5.0;
            double lowerBound = Math.Max(0, currentForecast - (i * 0.4) - 5.0);
            bool isAnomaly = i >= 20 && (metricName == "Latency" || metricName == "Memory");

            series.Add(new ForecastDataPointDto(
                time,
                Math.Round(currentForecast, 1),
                Math.Round(upperBound, 1),
                Math.Round(lowerBound, 1),
                isAnomaly
            ));
        }

        double forecasted30Min = series.Last().PredictedValue;
        double probability = forecasted30Min > 120 ? 0.89 : 0.24;

        string recommendation = probability > 0.7
            ? $"High risk of metric saturation in ~20 minutes. Pre-emptively scale out {targetService} replicas by +2 or enable Redis caching."
            : $"Metric trends for {targetService} are operating within nominal SRE thresholds (+-15%).";

        return new PredictiveAnomalyReportDto(
            metricName,
            targetService,
            currentValue,
            forecasted30Min,
            forecasted30Min > currentValue ? "UpwardSpike" : "Stable",
            probability,
            recommendation,
            series
        );
    }

    public SloAnalyticsSummaryDto EvaluateSloStatus()
    {
        var now = DateTime.UtcNow;
        var slos = new List<SloDefinitionDto>
        {
            new("slo-lat-p95", "P95 API Latency < 100ms", "ShopEasy Core API (Port 5001)", "Latency", 99.9, 99.94, 98.2, 1.0, "Met", now),
            new("slo-avail-999", "HTTP 2xx Availability Rate > 99.9%", "ShopEasy Gateway Proxy", "Availability", 99.9, 99.88, 42.5, 4.2, "AtRisk", now),
            new("slo-sql-p99", "SQL Execution Latency < 50ms", "MSSQL Database Cluster", "Latency", 99.5, 98.10, 0.0, 14.4, "Breached", now),
            new("slo-error-rate", "HTTP 5xx Error Rate < 0.1%", "Order Processing Engine", "ErrorRate", 99.9, 99.99, 99.5, 0.5, "Met", now)
        };

        var burnHistory = new List<ErrorBudgetBurnDataPoint>();
        double currentBudget = 100.0;

        for (int i = 24; i >= 0; i--)
        {
            var t = now.AddHours(-i);
            double burnStep = i < 6 ? 1.8 : 0.2;
            currentBudget = Math.Max(0, currentBudget - burnStep);

            burnHistory.Add(new ErrorBudgetBurnDataPoint(
                t,
                Math.Round(currentBudget, 1),
                i < 6 ? 4.2 : 0.8,
                Math.Round(35.0 + (24 - i) * 1.2, 1),
                Math.Round(65.0 + (24 - i) * 2.5, 1)
            ));
        }

        return new SloAnalyticsSummaryDto(
            slos.Count,
            slos.Count(s => s.HealthStatus == "Met"),
            slos.Count(s => s.HealthStatus == "AtRisk"),
            slos.Count(s => s.HealthStatus == "Breached"),
            99.91,
            slos,
            burnHistory
        );
    }
}
