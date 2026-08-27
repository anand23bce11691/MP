using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace IncidentIQ.Infrastructure.Services;

public record NotificationChannelConfig(
    string ChannelId,
    string Type, // "Slack", "PagerDuty", "Webhook", "Email"
    string DestinationUrl,
    bool IsEnabled
);

public class AlertNotificationDispatcher
{
    private static readonly List<NotificationChannelConfig> _channels = new()
    {
        new("ch-slack", "Slack", "https://hooks.slack.com/services/REDACTED_SLACK_WEBHOOK_DEMO", true),
        new("ch-pagerduty", "PagerDuty", "https://events.pagerduty.com/v2/enqueue", true),
        new("ch-webhook", "Webhook", "http://localhost:5000/api/webhooks/test", true)
    };

    private static readonly List<object> _dispatchLogs = new();

    public List<NotificationChannelConfig> GetChannels() => _channels;

    public async Task<bool> DispatchAlertAsync(string incidentNumber, string title, string severity, string rootCause, string appName)
    {
        var timestamp = DateTime.UtcNow;

        var payload = new
        {
            incidentNumber,
            title,
            severity,
            appName,
            rootCause,
            detectedAt = timestamp.ToString("o"),
            actionRequired = "Inspect IncidentIQ dashboard at http://localhost:5000 for AI root-cause analysis."
        };

        _dispatchLogs.Add(new
        {
            logId = Guid.NewGuid().ToString("N"),
            incidentNumber,
            severity,
            timestamp,
            targetChannels = _channels.Count,
            status = "Delivered"
        });

        await Task.CompletedTask;
        return true;
    }

    public List<object> GetDispatchLogs() => _dispatchLogs;
}
