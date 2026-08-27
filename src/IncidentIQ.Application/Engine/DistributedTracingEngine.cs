using System;
using System.Collections.Generic;
using System.Linq;
using IncidentIQ.Application.Dtos;

namespace IncidentIQ.Application.Engine;

public class DistributedTracingEngine
{
    private static readonly Random _random = new();

    public DistributedTraceDagDto GenerateSampleTraceDag(string traceId, string requestPath, double durationMs, int statusCode)
    {
        bool isError = statusCode >= 500;
        bool isSlow = durationMs > 500;

        string traceNum = string.IsNullOrWhiteSpace(traceId) ? $"tr-{_random.Next(100000, 999999)}" : traceId;

        var spans = new List<TraceSpanDto>();
        var now = DateTime.UtcNow;

        // Root Gateway Span
        var gatewaySpanId = $"sp-{_random.Next(1000, 9999)}";
        spans.Add(new TraceSpanDto(
            gatewaySpanId,
            "",
            traceNum,
            "ShopEasy Gateway Proxy",
            $"HTTP {requestPath}",
            now.AddMilliseconds(-durationMs),
            durationMs,
            statusCode,
            isError,
            isError ? "500 Internal Server Error propagated from upstream service" : null,
            new Dictionary<string, string>
            {
                { "http.method", "POST" },
                { "http.status_code", statusCode.ToString() },
                { "http.url", $"http://localhost:5001{requestPath}" },
                { "user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            },
            new List<SpanEventDto>
            {
                new(now.AddMilliseconds(-durationMs), "RequestReceived", "Ingress request parsed by edge gateway"),
                new(now.AddMilliseconds(-durationMs * 0.9), "AuthVerified", "JWT signature and API key validated"),
                new(now, "ResponseSent", $"Returned HTTP {statusCode}")
            }
        ));

        // Downstream E-Commerce Service Span
        var ecomSpanId = $"sp-{_random.Next(1000, 9999)}";
        double ecomDuration = durationMs * 0.85;
        spans.Add(new TraceSpanDto(
            ecomSpanId,
            gatewaySpanId,
            traceNum,
            "ShopEasy Core API (Port 5001)",
            "ExecuteOrderTransaction",
            now.AddMilliseconds(-ecomDuration),
            ecomDuration,
            statusCode,
            isError,
            isError ? "Order payment failure" : null,
            new Dictionary<string, string>
            {
                { "component", "ASP.NET Core Web API" },
                { "thread.id", "ThreadPoolWorker-14" },
                { "db.system", "Microsoft SQL Server 2022" }
            },
            new List<SpanEventDto>
            {
                new(now.AddMilliseconds(-ecomDuration), "ControllerInvoked", "ShopEasyController.CreateOrder"),
                new(now.AddMilliseconds(-ecomDuration * 0.5), "DbContextSaved", "EF Core SaveChangesAsync executed")
            }
        ));

        // Downstream SQL Database Span
        var sqlSpanId = $"sp-{_random.Next(1000, 9999)}";
        double sqlDuration = isSlow ? ecomDuration * 0.7 : _random.Next(4, 12);
        spans.Add(new TraceSpanDto(
            sqlSpanId,
            ecomSpanId,
            traceNum,
            "MSSQL Database Cluster (127.0.0.1:1433)",
            "INSERT INTO Orders & OrderItems",
            now.AddMilliseconds(-sqlDuration - 10),
            sqlDuration,
            isSlow ? 504 : 200,
            isSlow,
            isSlow ? "LockWaitTimeout: Transaction waiting on lock release for table Orders" : null,
            new Dictionary<string, string>
            {
                { "db.statement", "INSERT INTO [Orders] ([UserId], [TotalAmount]) VALUES (@p0, @p1)" },
                { "db.name", "IncidentIQDb" },
                { "db.rows_affected", "3" }
            },
            new List<SpanEventDto>
            {
                new(now.AddMilliseconds(-sqlDuration - 10), "DbConnectionAcquired", "Pool connection #12 acquired in 1ms"),
                new(now.AddMilliseconds(-10), "DbExecutionCompleted", $"Query executed in {sqlDuration:F1}ms")
            }
        ));

        // Downstream Redis Cache Span
        var redisSpanId = $"sp-{_random.Next(1000, 9999)}";
        double redisDuration = _random.Next(1, 4);
        spans.Add(new TraceSpanDto(
            redisSpanId,
            ecomSpanId,
            traceNum,
            "Redis L2 Distributed Cache",
            "GET catalog:products:active",
            now.AddMilliseconds(-ecomDuration * 0.95),
            redisDuration,
            200,
            false,
            null,
            new Dictionary<string, string>
            {
                { "redis.key", "catalog:products:active" },
                { "redis.cache_hit", "true" }
            },
            new List<SpanEventDto>
            {
                new(now.AddMilliseconds(-ecomDuration * 0.95), "CacheHit", "Retrieved 15 serialized items from Redis memory")
            }
        ));

        // Construct DAG Nodes & Edges
        var nodes = new List<TraceDagNodeDto>
        {
            new("node-gateway", "ShopEasy Gateway Proxy", "Service", Math.Round(durationMs, 1), isError ? 18 : 0, 185, isError ? "Critical" : (isSlow ? "Warning" : "Healthy")),
            new("node-api", "ShopEasy Core API (Port 5001)", "Service", Math.Round(ecomDuration, 1), isError ? 22 : 0, 185, isError ? "Critical" : (isSlow ? "Warning" : "Healthy")),
            new("node-db", "SQL Server Database (1433)", "Database", Math.Round(sqlDuration, 1), isSlow ? 45 : 0, 140, isSlow ? "Warning" : "Healthy"),
            new("node-redis", "Redis Cache Cluster", "Cache", Math.Round(redisDuration, 1), 0, 320, "Healthy")
        };

        var edges = new List<TraceDagEdgeDto>
        {
            new("node-gateway", "node-api", "HTTP/REST", 185, Math.Round(ecomDuration, 1)),
            new("node-api", "node-db", "SQL/T-SQL", 140, Math.Round(sqlDuration, 1)),
            new("node-api", "node-redis", "Redis Binary", 320, Math.Round(redisDuration, 1))
        };

        return new DistributedTraceDagDto(
            traceNum,
            "ShopEasy Gateway Proxy",
            Math.Round(durationMs, 1),
            spans.Count,
            isError,
            nodes,
            edges,
            spans
        );
    }
}
