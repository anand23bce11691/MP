# IncidentIQ monitoring platform

IncidentIQ is an independent web application that monitors multiple external web applications. It supports two paths of observation:

- **Push telemetry:** the monitored application sends request timing, status, errors, and messages to IncidentIQ's ingestion API using its unique key.
- **Synthetic probes:** IncidentIQ calls configured health/endpoint URLs on a schedule and records the result.

The web interface is the primary product surface. Swagger is not configured or exposed.

## Run locally

```powershell
dotnet run --project .\src\IncidentIQ.WebApi
```

Open the localhost URL printed by .NET. The default SQLite database (`incidentiq-platform.db`) is created automatically beside the Web API project.

## Connect an application

1. In IncidentIQ, select **Connect application** and enter the application name and base URL.
2. Copy the one-time API key shown after registration.
3. From the monitored application's middleware or error handler, post telemetry:

```http
POST /api/monitoring/ingest
X-IncidentIQ-Key: <generated-key>
Content-Type: application/json

{
  "eventType": "request",
  "endpoint": "/api/orders",
  "statusCode": 503,
  "durationMs": 1850,
  "severity": "Error",
  "message": "Payment-provider timeout"
}
```

Server failures, explicit Error/Critical telemetry, and response times above 1,500 ms create a persisted incident with evidence and recommended next actions. New incidents are debounced for five minutes per target application.

## SQL Server / Docker deployment

Copy `.env.example` to `.env`, choose a strong password, then run:

```powershell
docker compose up --build
```

Open `http://localhost:8080`. For an existing SQL Server IncidentIQ database, run [001_initial_schema.sql](database/001_initial_schema.sql) followed by [002_monitoring_platform.sql](database/002_monitoring_platform.sql). For a new container database, IncidentIQ creates its model automatically at first startup.

## Scalability notes

For a multi-instance deployment, use SQL Server as the shared persistence layer, place the app behind a reverse proxy, and move endpoint probing and anomaly evaluation to a worker service/queue. The current hosted probe worker is suitable for localhost and a single-node deployment.
