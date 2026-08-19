namespace IncidentIQ.Domain.Entities;

public class ApplicationLog
{
    public long LogId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string RequestMethod { get; set; } = string.Empty;
    public string RequestPath { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public double ResponseTimeMs { get; set; }
    public double SqlTimeMs { get; set; }
    public string? ErrorMessage { get; set; }
}
