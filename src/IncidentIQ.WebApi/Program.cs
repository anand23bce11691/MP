using IncidentIQ.Application.Engine;
using IncidentIQ.Application.Interfaces;
using IncidentIQ.Infrastructure.Data;
using IncidentIQ.Infrastructure.HostedServices;
using IncidentIQ.Infrastructure.Interceptors;
using IncidentIQ.Infrastructure.Services;
using IncidentIQ.WebApi.Hubs;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Register EF Core Interceptor
builder.Services.AddSingleton<EfQueryInterceptor>();

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<EfQueryInterceptor>();
    var sqlConnectionString = builder.Configuration.GetConnectionString("SqlServer")
        ?? builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("SQL Server ConnectionString is required.");
    options.UseSqlServer(sqlConnectionString, sqlOptions => sqlOptions.EnableRetryOnFailure());
    options.AddInterceptors(interceptor);
});

// AI Engines & Simulation Services
builder.Services.AddSingleton<IFailureSimulationManager, FailureSimulationManager>();
builder.Services.AddSingleton<ITrafficSimulatorService, TrafficSimulatorService>();
builder.Services.AddSingleton<IAnomalyDetectionEngine, AnomalyDetectionEngine>();
builder.Services.AddSingleton<IRootCauseAnalysisEngine, RootCauseAnalysisEngine>();

// Hosted Background Services
builder.Services.AddHostedService<SystemMetricsWorker>();
builder.Services.AddHostedService<TrafficSimulatorService>(sp => (TrafficSimulatorService)sp.GetRequiredService<ITrafficSimulatorService>());

// SignalR & Web Controllers
builder.Services.AddSignalR();
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Swagger OpenAPI Generation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "IncidentIQ API Engine",
        Version = "v1",
        Description = "Telemetry Monitoring, Chaos Failure Injection, and AI Root-Cause Analysis Engine"
    });
});

var app = builder.Build();

// Enable Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "IncidentIQ API v1");
    c.RoutePrefix = "swagger";
});

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        DbInitializer.Initialize(db);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DB Setup Warning] SQL Server connection issue: {ex.Message}");
    }
}

// Pipeline Configuration
app.UseMiddleware<TelemetryCollectorMiddleware>();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.MapControllers();
app.MapHub<TelemetryHub>("/hubs/telemetry");

app.Run();
