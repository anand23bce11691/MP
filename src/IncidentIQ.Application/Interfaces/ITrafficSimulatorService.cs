namespace IncidentIQ.Application.Interfaces;

public interface ITrafficSimulatorService
{
    string CurrentMode { get; }
    void SetMode(string mode); // "Normal" (100 RPM), "High" (1000 RPM), "Extreme" (3000 RPM)
}
