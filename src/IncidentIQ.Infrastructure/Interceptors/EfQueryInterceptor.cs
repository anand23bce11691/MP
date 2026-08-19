using System.Data.Common;
using System.Diagnostics;
using IncidentIQ.Application.Interfaces;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace IncidentIQ.Infrastructure.Interceptors;

public class EfQueryInterceptor : DbCommandInterceptor
{
    private readonly IFailureSimulationManager _simulationManager;
    private static readonly List<double> _recentSqlTimes = new();
    private static readonly object _lock = new();

    public EfQueryInterceptor(IFailureSimulationManager simulationManager)
    {
        _simulationManager = simulationManager;
    }

    public static double GetAverageSqlLatencyMs()
    {
        lock (_lock)
        {
            if (_recentSqlTimes.Count == 0) return 45.0; // Baseline
            var avg = _recentSqlTimes.Average();
            _recentSqlTimes.Clear();
            return avg;
        }
    }

    public override async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result,
        CancellationToken cancellationToken = default)
    {
        var state = _simulationManager.GetState();
        if (state.IsDbSlowdownActive || state.IsCascadingFailureActive)
        {
            // Inject artificial database latency delay
            await Task.Delay(state.DbDelayMs, cancellationToken);
        }

        return await base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
    }

    public override async ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        var durationMs = eventData.Duration.TotalMilliseconds;
        var state = _simulationManager.GetState();
        if (state.IsDbSlowdownActive || state.IsCascadingFailureActive)
        {
            durationMs += state.DbDelayMs;
        }

        lock (_lock)
        {
            _recentSqlTimes.Add(durationMs);
            if (_recentSqlTimes.Count > 100) _recentSqlTimes.RemoveAt(0);
        }

        return await base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }
}
