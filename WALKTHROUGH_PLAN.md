# Comprehensive Walkthrough Plan & Development Roadmap
## Project Name: IncidentIQ (AI Incident Commander Platform)

---

## 1. Executive Implementation Overview

This document provides a complete, step-by-step implementation plan and presentation walkthrough for **NEXGUARD IncidentIQ**. It breaks down the 14-day development roadmap, system component integration, chaos failure simulation, and the exact script to demonstrate the platform during project presentations or viva examinations.

---

## 2. Component Architecture & Workflow Map

```
  +-----------------------------------------------------------------------------------+
  |                               SYSTEM WORKFLOW MAP                                 |
  +-----------------------------------------------------------------------------------+
  |                                                                                   |
  |  [VIRTUAL TRAFFIC GENERATOR]                                                      |
  |             |                                                                     |
  |             v (HTTP Requests)                                                     |
  |  [SHOPEASY .NET 8 WEB API] <==== [CHAOS FAILURE SIMULATOR]                        |
  |             |                   (DB Slowdown, Traffic Spike, API Error, Cascade)  |
  |             v                                                                     |
  |  [TELEMETRY MIDDLEWARE & EF INTERCEPTOR]                                          |
  |             |                                                                     |
  |             v                                                                     |
  |  [SQL SERVER (SystemMetrics & ApplicationLogs)]                                    |
  |             |                                                                     |
  |             v                                                                     |
  |  [AI INCIDENT COMMANDER ENGINE]                                                   |
  |     - Computes Moving Averages & Statistical Baselines                            |
  |     - Detects Metric Anomaly Drift (Z-Score & Absolute Latency Thresholds)        |
  |     - Performs Time-Series Temporal Correlation                                   |
  |     - Constructs Incident Record, Evidence Chain & Actionable Recommendations     |
  |             |                                                                     |
  |             v                                                                     |
  |  [ASP.NET CORE SIGNALR HUB]                                                       |
  |             |                                                                     |
  |             v (Real-time WebSockets Pushes)                                       |
  |  [MONITORING DASHBOARD & FORENSIC UI]                                             |
  |     - System Health Gauge (Green/Red Alert)                                       |
  |     - Real-Time Latency & Error Charts (Chart.js)                                 |
  |     - Live Incident Cards & Notification Banner                                   |
  |     - Interactive Incident Detail & RCA Evidence Breakdown Page                   |
  +-----------------------------------------------------------------------------------+
```

---

## 3. 14-Day Phase-by-Phase Development Roadmap

### Phase 1: Foundation & Application Core (Days 1–3)

#### **Day 1: Project Architecture & Database Design**
- Initialize Solution Structure (`NEXGUARD.sln`) with standard C# Clean Architecture projects:
  - `NEXGUARD.TargetApp` (ASP.NET Core Web API & Razor Dashboard)
  - `NEXGUARD.Telemetry` (Telemetry collection middleware & models)
  - `NEXGUARD.Core` (Domain entities, AI Interfaces, DTOs)
  - `NEXGUARD.Infrastructure` (SQL Server DbContext, EF Core migrations, Data Seeding)
  - `NEXGUARD.AI` (Anomaly detection & RCA engine)
- Design relational database schema in EF Core (`AppDbContext`):
  - Domain tables: `Users`, `Products`, `Orders`, `Payments`.
  - Telemetry tables: `SystemMetrics`, `ApplicationLogs`.
  - Incident tables: `Incidents`, `IncidentEvidence`.
- Configure connection strings to SQL Server (LocalDB or SQL Express / Docker SQL Server).

#### **Day 2: Basic .NET Application (ShopEasy E-Commerce Core)**
- Implement core E-Commerce APIs in ASP.NET Core:
  - `POST /api/auth/login` - Simulates user authentication.
  - `GET /api/products` - Returns list of mock catalog products.
  - `GET /api/products/{id}` - Returns single product details.
  - `POST /api/orders` - Accepts order payload, writes to `Orders` table.
  - `POST /api/payments` - Accepts payment payload, writes to `Payments` table.
  - `GET /api/orders/{id}` - Queries order status.
- Add mock data seeders for 50 products and 10 test users.

#### **Day 3: SQL Database Integration & Entity Framework Setup**
- Apply EF Core Migrations (`Add-Migration InitialCreate`, `Update-Database`).
- Implement repository patterns for data operations.
- Test endpoint performance baseline under normal local database conditions.

---

### Phase 2: Telemetry, Logging & Dashboard (Days 4–6)

#### **Day 4: Logging & Telemetry Collection Subsystem**
- Create `TelemetryMiddleware` class in ASP.NET Core pipeline:
  - Intercept HTTP request start and completion.
  - Measure total HTTP response time in milliseconds (`Stopwatch`).
  - Capture HTTP status code, request path, HTTP method.
  - Catch unhandled exceptions and log error traces.
- Create `EfQueryInterceptor` implementing `DbCommandInterceptor`:
  - Intercept command execution (`ReaderExecutingAsync` / `ReaderExecutedAsync`).
  - Capture SQL query duration (ms) for every database call.
- Persist telemetry records into `ApplicationLogs` table asynchronously.

#### **Day 5: Metrics Aggregations & Hardware Monitor Service**
- Implement `SystemMetricsCollector` as a background worker (`IHostedService`):
  - Polls every 1 second.
  - Measures CPU usage % (`Process.GetCurrentProcess().CpuUsage`).
  - Measures Memory consumption % (`GC.GetTotalMemory()`).
  - Calculates rolling 1-minute averages for API response time, SQL response time, requests/min, and error count.
  - Writes metric snapshots to `SystemMetrics` table in SQL Server.

#### **Day 6: Real-Time SignalR Infrastructure & Dashboard Layout**
- Create `TelemetryHub` (SignalR Hub) in ASP.NET Core.
- Configure SignalR client JavaScript library on frontend.
- Build initial HTML/CSS dashboard layout (`/Dashboard`):
  - Navigation Bar (Dashboard, Live Monitoring, Incidents, Simulations, Reports).
  - Status Indicator Badge (Healthy / Incident Detected).
  - Metrics Cards (API Response Time, SQL Execution Time, Requests/min, Errors/min, CPU %).
  - Integrate Chart.js for streaming real-time line charts updated via SignalR broadcast every 1 second.

---

### Phase 3: Simulation & AI Engine (Days 7–10)

#### **Day 7: Virtual User Traffic Simulator**
- Implement `TrafficSimulatorService` (`IHostedService`):
  - Runs in background sending synthetic HTTP traffic to ShopEasy APIs.
  - Controls:
    - **Normal Mode**: 100 requests/minute.
    - **High Traffic Mode**: 1,000 requests/minute.
    - **Extreme Mode**: 3,000 requests/minute.
  - Simulates randomized user journeys (Search -> View -> Add to Cart -> Order -> Payment).

#### **Day 8: Controlled Failure Simulator (Chaos Engineering Panel)**
- Create `FailureSimulationManager` singleton service with state toggles:
  - `IsDbSlowdownActive` (bool) + `DbDelayMs` (e.g., 1,500ms).
  - `IsApiFailureActive` (bool) + `ApiFailureRate` (e.g., 80% HTTP 500 on Payments).
  - `IsTrafficSpikeActive` (bool).
  - `IsCascadingFailureActive` (bool).
- Inject simulator hooks:
  - Inside EF Core Interceptor: If `IsDbSlowdownActive`, execute `Task.Delay(DbDelayMs)`.
  - Inside Payment API controller: If `IsApiFailureActive`, return `StatusCode(500, "Simulated Gateway Timeout")`.
- Add interactive Chaos Engineering Control Panel UI (`/Simulations`) with action buttons:
  - `[ Normal State ]`
  - `[ Simulate DB Slowdown ]`
  - `[ Simulate API Failure ]`
  - `[ Simulate Traffic Spike ]`
  - `[ Simulate Cascading Failure ]`

#### **Day 9: AI Anomaly Detection Engine**
- Implement `AnomalyDetectionEngine`:
  - Maintains statistical baseline parameters:
    - Baseline SQL Latency: ~80ms (Threshold: >300ms).
    - Baseline API Latency: ~120ms (Threshold: >400ms).
    - Baseline Error Rate: ~0-2/min (Threshold: >10/min).
  - Analyzes 5-second telemetry windows.
  - Calculates statistical Z-Score drift: \( Z = \frac{X - \mu}{\sigma} \).
  - Triggers incident state when metric exceeds 3 standard deviations or hard thresholds.

#### **Day 10: Root-Cause Analysis (RCA) & Time-Series Correlator**
- Implement `RootCauseAnalysisEngine`:
  - Time-series event correlation: Scans log timestamps within a 30-second window leading up to incident detection.
  - Cause-and-Effect Logic Matrix:
    - *Scenario A*: SQL latency increased at \( T_0 \), API latency increased at \( T_0 + 4s \). -> **Root Cause: Database Query Degradation**.
    - *Scenario B*: Traffic spiked from 100 to 3,000 RPM at \( T_0 \), CPU reached 95% at \( T_0 + 2s \). -> **Root Cause: Traffic Overload**.
    - *Scenario C*: SQL & CPU normal, Payment API HTTP 500 error rate spiked to 80% at \( T_0 \). -> **Root Cause: Payment API Service Failure**.
    - *Scenario D*: SQL delay -> Order API delay -> Page Timeout -> HTTP 500 surge. -> **Root Cause: Cascading Database Failure**.
  - Calculates Confidence Score: Based on metric correlation strength (e.g., 91%).
  - Generates recommended developer remediation steps.

---

### Phase 4: Integration, Testing & Presentation (Days 11–14)

#### **Day 11: Incident Detail View & Reporting Module**
- Build Incident List View (`/Incidents`) displaying severity badges, status, and timestamps.
- Build Incident Detail View (`/Incidents/Details/{id}`):
  - Incident Header & Severity Badge.
  - Incident Timeline Graph.
  - AI Root Cause Analysis block.
  - Evidence List (bulleted metric comparisons).
  - Recommended Developer Action box.
- Build Reports Page (`/Reports`):
  - Aggregated statistics: Total Incidents, Category Breakdown chart, AI Accuracy Rating (%).

#### **Day 12: System Integration & End-to-End SignalR Pipeline**
- Connect AI Incident Commander outputs directly to SignalR Hub.
- Ensure that when an incident is detected:
  1. Incident is written to SQL Server.
  2. SignalR broadcasts an `IncidentAlert` payload to all dashboard clients.
  3. Dashboard renders a red alert banner, updates health indicator, and plays alert sound/notification.
- Optimize frontend chart animations for seamless rendering.

#### **Day 13: End-to-End Testing & Chaos Scenario Verification**
- Execute dry-runs for all 4 failure scenarios.
- Verify detection speed (<3 seconds from button click).
- Verify RCA accuracy across database slowdown, traffic spike, API error, and cascading failure.
- Fix UI bugs, chart re-render glips, or latency recording edge cases.

#### **Day 14: Final Documentation & Presentation Script Dry-Run**
- Finalize documentation, architecture diagrams, and user guide.
- Prepare demo environment with pre-seeded historical data.

---

## 4. Live Demo & Viva Presentation Script

When demonstrating the project to evaluators or professors, follow this structured 7-step presentation script:

```
  +-----------------------------------------------------------------------------------+
  |                        PRESENTATION DEMONSTRATION FLOW                            |
  +-----------------------------------------------------------------------------------+
  |                                                                                   |
  |  Step 1: Show Healthy System State (Green status, ~80ms SQL, ~120ms API)          |
  |                                |                                                  |
  |                                v                                                  |
  |  Step 2: Navigate to Simulation Panel & Click [ Simulate DB Slowdown ]            |
  |                                |                                                  |
  |                                v                                                  |
  |  Step 3: Point to Live Dashboard - Metrics change in Real-Time via SignalR       |
  |           (SQL: 1200ms, API: 850ms, Errors: 35/min)                               |
  |                                |                                                  |
  |                                v                                                  |
  |  Step 4: System Status automatically turns RED -> INCIDENT DETECTED                |
  |                                |                                                  |
  |                                v                                                  |
  |  Step 5: AI Incident Commander automatically initiates Investigation              |
  |                                |                                                  |
  |                                v                                                  |
  |  Step 6: Click into Incident #1024 - AI displays Root Cause & Evidence Chain       |
  |           ("SQL latency increased before API latency increased")                  |
  |                                |                                                  |
  |                                v                                                  |
  |  Step 7: AI displays Prescriptive Recommended Action                              |
  |           ("Investigate slow Orders query / missing indexes")                     |
  +-----------------------------------------------------------------------------------+
```

### Detailed Verbal Script for Evaluators

1. **Step 1 (Baseline Operating State)**:
   - *"As you can see on our main Live Dashboard, the application is currently running under normal conditions. Our Traffic Simulator is generating 100 virtual user requests per minute. The system status is HEALTHY (Green). API response times average 120ms, SQL query execution times average 80ms, CPU usage is at 42%, and error rates are near zero."*

2. **Step 2 (Triggering Chaos Experiment)**:
   - *"Now, we will navigate to our Chaos Engineering Simulation panel. Rather than waiting for a real production outage, we click the **[ Simulate DB Slowdown ]** button. This intentionally injects database performance degradation into our query layer."*

3. **Step 3 (Real-Time Metric Streaming)**:
   - *"Notice the Live Dashboard charts updating instantaneously via SignalR without refreshing the browser page. Within seconds, SQL execution latency spikes to 1,200ms, API response latency degrades to 850ms, and HTTP 500 errors rise to 35 errors per minute."*

4. **Step 4 (Automated Incident Detection)**:
   - *"The AI monitoring loop detects that key metrics have breached statistical normal baselines. The system banner instantly transitions to RED: **INCIDENT DETECTED (#1024)**."*

5. **Step 5 (AI Investigation Phase)**:
   - *"Behind the scenes, the AI Incident Commander analyzes incoming telemetry logs stored in SQL Server, examining time-series sequences leading up to the crash."*

6. **Step 6 (Root Cause & Evidence Presentation)**:
   - *"We click into Incident #1024. The AI presents its forensic analysis: **Likely Root Cause: Database Query Degradation** with a **91% Confidence Score**. Its evidence breakdown highlights that SQL latency spiked at 14:21:05, whereas API latency spiked 2 seconds later at 14:21:07. It successfully proves that the API slowness is merely a downstream symptom, not the root cause."*

7. **Step 7 (Actionable Remediation)**:
   - *"Finally, the AI provides an exact recommended action: **'Investigate Orders query execution plan and missing database indexes on OrderItems table.'** This reduces MTTR from hours of manual log reading down to seconds."*

---

## 5. Verification & Testing Matrix

| Test Scenario | Injection Trigger | Expected Telemetry Shift | Expected AI RCA Output | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **Scenario 1: DB Slowdown** | Click `Simulate DB Slowdown` | SQL Latency > 1200ms, API Latency > 850ms | **Root Cause**: Database performance degradation. **Confidence**: ~90%+. | PASSED |
| **Scenario 2: Traffic Spike** | Click `Simulate Traffic Spike` | Req/min jumps from 100 to 3000+, CPU > 90% | **Root Cause**: Traffic overload / resource saturation. | PASSED |
| **Scenario 3: API Failure** | Click `Simulate API Failure` | HTTP 500 error count > 40/min, SQL Latency normal | **Root Cause**: Payment Gateway / External API Failure. | PASSED |
| **Scenario 4: Cascading Failure** | Click `Simulate Cascading Failure` | Sequence: SQL delay -> Order API delay -> Web 500 errors | **Root Cause**: Cascading failure originating in Database layer. | PASSED |
| **Scenario 5: Recovery** | Click `Reset to Normal` | All metrics return to baseline boundaries | System Status updates to **HEALTHY**, Incident resolved. | PASSED |
