using System.Threading.Tasks;

namespace IncidentIQ.Application.Interfaces
{
    public class GeminiAiRecommendation
    {
        public string ExecutiveSummary { get; set; } = string.Empty;
        public string RootCauseDiagnosis { get; set; } = string.Empty;
        public string ActionableRemediationCode { get; set; } = string.Empty;
        public string PreventionAdvice { get; set; } = string.Empty;
        public int ConfidenceScore { get; set; } = 95;
    }

    public interface IGeminiAiAdvisorService
    {
        Task<GeminiAiRecommendation> AnalyzeIncidentAsync(string incidentTitle, string severity, string telemetryEvidence, string rawLogs);
    }
}
