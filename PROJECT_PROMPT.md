# Master System Prompt: NEXGUARD IncidentIQ Building Instruction

> **System Prompt Usage**: Copy and paste the prompt below into an AI agent (such as Antigravity, Claude, ChatGPT, or GitHub Copilot) to generate the complete, production-ready source code for the **NEXGUARD IncidentIQ** project.

---

```text
YOU ARE AN EXPERT PRINCIPAL .NET ARCHITECT, FULL-STACK DEVELOPER, AND AI MONITORING ENGINEER.

YOUR TASK IS TO DESIGN AND BUILD A COMPLETE, FULLY-FUNCTIONAL .NET 8 APPLICATION TITLED:
"NEXGUARD IncidentIQ - AI-Powered Intelligent Incident Detection & Root-Cause Analysis Platform" (ALSO REFERRED TO AS CAUSIQ / AI INCIDENT COMMANDER).

===================================================================================
1. PROJECT CONTEXT & CONCEPT OVERVIEW
===================================================================================
Modern software applications often experience performance degradation, database bottlenecks, or cascading service failures. Finding the root cause requires developers to manually parse thousands of logs and performance metrics.

You will build a self-contained system consisting of two integrated parts:
1. Target Application ("ShopEasy"): A mini E-Commerce application (.NET 8 Web API + SQL Server) with Users, Products, Orders, and Payments.
2. AI Incident Commander Platform: An AI-powered monitoring platform that continuously collects application telemetry, computes moving metric baselines, detects abnormal behaviors, performs time-series root-cause analysis (RCA), and pushes real-time alerts via SignalR to a live web dashboard.

To evaluate the system realistically without actual production traffic, you will also implement:
- Synthetic Traffic Simulator: Generates virtual user activity (100 to 3,000 requests/minute).
- Chaos Failure Simulator: Interactive control panel to inject 4 failure modes (Database Slowdown, Traffic Spike, API Failure, Cascading Failure).

===================================================================================
2. TECHNICAL STACK & DEPENDENCIES
===================================================================================
- Language & Runtime: C# / .NET 8 / ASP.NET Core
- Persistence: SQL Server + Entity Framework Core 8
- Real-Time Communication: ASP.NET Core SignalR
- Frontend UI: ASP.NET Core Razor Pages / MVC Views or HTML5/CSS3/JavaScript (ES6+) with Chart.js
- Background Processing: ASP.NET Core IHostedService / BackgroundWorker
- Design Aesthetic: Modern, sleek dark-mode telemetry dashboard (Glassmorphism, vibrant status indicators, responsive cards, real-time streaming line graphs)

===================================================================================
3. SOLUTION ARCHITECTURE & FILE STRUCTURE
===================================================================================
Create a solution named `NEXGUARD.sln` containing the following project layout:

NEXGUARD.sln
├── src/
│   ├── NEXGUARD.Domain/
│   │   ├── Entities/ (User.cs, Product.cs, Order.cs, Payment.cs, SystemMetric.cs, ApplicationLog.cs, Incident.cs, IncidentEvidence.cs)
│   │   └── Enums/ (IncidentType.cs, SeverityLevel.cs, IncidentStatus.cs)
│   │
│   ├── NEXGUARD.Infrastructure/
│   │   ├── Data/ (AppDbContext.cs, DbInitializer.cs)
│   │   ├── Interceptors/ (EfQueryInterceptor.cs)
│   │   └── Repositories/ (TelemetryRepository.cs, IncidentRepository.cs)
│   │
│   ├── NEXGUARD.Services/
│   │   ├── Telemetry/ (TelemetryCollectorMiddleware.cs, SystemMetricsWorker.cs)
│   │   ├── Simulators/ (TrafficSimulatorService.cs, FailureSimulationManager.cs)
│   │   ├── AI/ (AnomalyDetectionEngine.cs, RootCauseAnalysisEngine.cs)
│   │   └── Hubs/ (TelemetryHub.cs)
│   │
│   └── NEXGUARD.Web/
│       ├── Controllers/ (AuthApiController.cs, ProductsApiController.cs, OrdersApiController.cs, PaymentsApiController.cs, SimulationApiController.cs, IncidentsApiController.cs)
│       ├── Views/ (Dashboard, LiveMonitoring, Incidents, IncidentDetails, Simulations, Reports)
│       ├── wwwroot/
│       │   ├── css/ (site.css - Dark mode styling)
│       │   └── js/ (dashboard.js, signalr-client.js, charts.js)
│       └── Program.cs

===================================================================================
4. DETAILED IMPLEMENTATION INSTRUCTIONS BY MODULE
===================================================================================

-----------------------------------------------------------------------------------
MODULE 1: SHOPEASY TARGET APPLICATION & DOMAIN ENTITIES
-----------------------------------------------------------------------------------
Implement standard entity models and EF Core mappings:
- `User`: UserId, Username, Email, CreatedAt.
- `Product`: ProductId, Name, Price, StockQuantity.
- `Order`: OrderId, UserId, TotalAmount, Status, CreatedAt.
- `Payment`: PaymentId, OrderId, Amount, PaymentMethod, Status, CreatedAt.

Expose the following REST APIs:
- `POST /api/auth/login`: Authenticate test users.
- `GET /api/products`: Return product catalog list.
- `GET /api/products/{id}`: Return product detail.
- `POST /api/orders`: Create new order.
- `POST /api/payments`: Process payment (hooked into Failure Simulator for API failure testing).
- `GET /api/orders/{id}`: Return order status.

Seed the database with 50 sample products and 10 default users on startup.

-----------------------------------------------------------------------------------
MODULE 2: TELEMETRY & LOGGING MIDDLEWARE
-----------------------------------------------------------------------------------
1. `TelemetryCollectorMiddleware`:
   - Intercept every incoming HTTP request.
   - Use `Stopwatch` to measure precise API response time (ms).
   - Log HTTP Method, Path, Status Code, Timestamp, and Response Time.
   - If an exception occurs, log error trace and status code 500.

2. `EfQueryInterceptor` (DbCommandInterceptor):
   - Intercept EF Core database command executions (`ReaderExecutingAsync` / `ReaderExecutedAsync`).
   - Calculate SQL query execution time in milliseconds.
   - Store SQL query duration in `ApplicationLogs` table.
   - Check `FailureSimulationManager.IsDbSlowdownActive`. If true, inject `Task.Delay(DbDelayMs)` (e.g., 1500ms delay) to simulate database degradation.

3. `SystemMetricsWorker` (IHostedService):
   - Runs continuously every 1 second.
   - Gathers snapshot data: API Latency, SQL Latency, Requests/min, Errors/min, CPU Usage %, Memory Usage %, Active DB Connections.
   - Persists snapshot to `SystemMetrics` table in SQL Server.
   - Broadcasts the metrics payload over SignalR to all connected web clients via `TelemetryHub`.

-----------------------------------------------------------------------------------
MODULE 3: SYNTHETIC TRAFFIC SIMULATOR
-----------------------------------------------------------------------------------
Implement `TrafficSimulatorService` as an `IHostedService`:
- Runs in the background and sends synthetic HTTP traffic to ShopEasy APIs.
- Supports 3 modes toggled via UI/API:
  - Normal Mode: 100 requests/minute.
  - High Traffic Mode: 1,000 requests/minute.
  - Extreme Mode: 3,000 requests/minute.
- Simulates realistic user flows (e.g., GET /products -> GET /products/5 -> POST /orders -> POST /payments).

-----------------------------------------------------------------------------------
MODULE 4: CHAOS FAILURE SIMULATOR
-----------------------------------------------------------------------------------
Implement `FailureSimulationManager` singleton service with 4 controllable failure modes:
1. `Simulate DB Slowdown`: Injects 1,500ms delay into SQL queries via EF Core Interceptor.
2. `Simulate Traffic Spike`: Forces Traffic Simulator to burst to 3,000+ requests/min.
3. `Simulate API Failure`: Causes `POST /api/payments` to return HTTP 500 error 80% of the time.
4. `Simulate Cascading Failure`: Injects SQL delay -> Order API latency -> Payment API timeouts -> System-wide HTTP 500 error wave.

Expose API endpoints in `SimulationApiController` to allow UI button clicks to trigger/reset failure states.

-----------------------------------------------------------------------------------
MODULE 5: AI ANOMALY DETECTION & ROOT-CAUSE ANALYSIS (RCA) ENGINE
-----------------------------------------------------------------------------------
Implement `AnomalyDetectionEngine` & `RootCauseAnalysisEngine`:

1. Baseline Engine:
   - Maintains rolling average baselines (SQL Latency ~80ms, API Latency ~120ms, Error Rate ~0-2/min).

2. Anomaly Evaluator:
   - Runs every 3 seconds inspecting current telemetry windows against historical baseline.
   - Calculates Z-score drift and absolute metric thresholds.
   - If anomaly is detected, creates an `Incident` record with severity level (LOW, MEDIUM, HIGH, CRITICAL).

3. Time-Series RCA Engine:
   - Inspects the chronological sequence of metric degradation leading up to the incident:
     - IF SQL Latency spiked BEFORE API Latency spiked:
       -> Root Cause = "Database Performance Degradation / Query Latency"
       -> Evidence = "SQL execution latency increased from 80ms to 1,200ms at 14:21:05 (2s prior to API response time increase)."
       -> Recommended Action = "Investigate slow Orders query execution plan, check missing database indexes, and optimize connection pool."
     - IF Request Volume jumped 300% & CPU > 90% BEFORE latency increased:
       -> Root Cause = "Traffic Overload / Resource Saturation"
       -> Evidence = "Request rate surged from 100 to 3,000 req/min; CPU saturation reached 92%."
       -> Recommended Action = "Scale application instances horizontally and implement rate-limiting middleware."
     - IF SQL latency normal & Payment API 500 error rate > 50%:
       -> Root Cause = "Payment Gateway / External API Failure"
       -> Evidence = "HTTP 500 error rate spiked to 35/min on POST /api/payments while database latency remained normal at 82ms."
       -> Recommended Action = "Verify external payment service API credentials, review retry policy, and inspect upstream service gateway."

4. SignalR Alert Integration:
   - Automatically serializes incident metadata and broadcasts `IncidentAlert` event to the web dashboard.

-----------------------------------------------------------------------------------
MODULE 6: REAL-TIME MONITORING DASHBOARD UI
-----------------------------------------------------------------------------------
Build a sleek, dark-mode web portal:

1. Main Dashboard (`/`):
   - Header with Global Health Badge (`HEALTHY` [Green] / `INCIDENT DETECTED` [Red Alert]).
   - Real-Time KPI Cards: API Latency (ms), SQL Latency (ms), CPU Usage %, Requests/min, Errors/min.
   - Real-Time Line Charts (Chart.js): Streaming metrics updated live via SignalR without refreshing page.
   - Active Incident Alert Banner & Quick Summary card.

2. Live Monitoring Page (`/LiveMonitoring`):
   - Deep-dive real-time charts comparing API Latency vs SQL Latency over time.

3. Failure Simulation Panel (`/Simulations`):
   - Interactive control panel with buttons:
     - `[ Reset Normal State ]`
     - `[ Simulate DB Slowdown ]`
     - `[ Simulate API Failure ]`
     - `[ Simulate Traffic Spike ]`
     - `[ Simulate Cascading Failure ]`
   - Real-time indicator showing currently active chaos injection.

4. Incidents List & Incident Details Page (`/Incidents` & `/Incidents/Details/{id}`):
   - Incident List with filterable severity badges.
   - Incident Details view presenting:
     - Incident Header & Severity Badge.
     - Forensic Metric Timeline.
     - AI Root Cause Analysis explanation.
     - Evidence Breakdown (bullet points).
     - Actionable Recommended Fix.

5. Raw Logs & Telemetry Inspector (`/Logs`):
   - Data grid listing raw request logs, SQL query durations, and status codes.

6. Historical Reports Page (`/Reports`):
   - Pie chart of incidents by type.
   - AI Detection Accuracy rating (%).

===================================================================================
5. DEFINITION OF DONE & VERIFICATION CRITERIA
===================================================================================
1. The application compiles cleanly with zero warnings or errors on .NET 8.
2. Clicking `[ Simulate DB Slowdown ]` causes SQL latency to jump on the dashboard within 1-2 seconds via SignalR.
3. Within 3 seconds of failure injection, the system status turns RED (`INCIDENT DETECTED`) and an incident record appears.
4. Clicking into the incident reveals an accurate AI Root-Cause explanation ("Database Performance Degradation") with a >90% confidence score and actionable developer recommendations.
5. Clicking `[ Reset Normal State ]` restores metrics to baseline and updates health back to `HEALTHY`.
```
