# Requirements Analysis Document (RAD)
## Project Name: IncidentIQ (AI-Powered Intelligent Incident Detection & Root-Cause Analysis Platform)

---

## 1. Executive Summary & Project Purpose

**IncidentIQ** (also referenced as **CAUSIQ** or **AI Incident Commander**) is an intelligent, real-time telemetry monitoring, anomaly detection, and automated root-cause analysis (RCA) platform built on **.NET 8** and **SQL Server**.

Modern software applications often degrade or crash due to complex, cascading failures—such as database queries slowing down, unindexed table scans, sudden traffic surges, or downstream API timeouts. Diagnosing these failures manually requires engineers to parse through thousands of raw application logs, database execution traces, and server performance metrics, causing high Mean Time to Resolution (MTTR).

IncidentIQ solves this problem by coupling a target micro-application (a mini E-Commerce system named **ShopEasy**) with an **AI Incident Commander**. The platform continuously collects application telemetry, evaluates metric drifts against historical baselines, detects anomalies in real-time, correlates time-series events, pinpoints the root cause, and prescribes exact remediation steps for developers. To allow reproducible evaluation without relying on production traffic, IncidentIQ incorporates a **Controlled Traffic Simulator** (virtual users) and a **Chaos Failure Simulator**.

---

## 2. Problem Statement & Business Objectives

### 2.1 Problem Statement
- **Diagnostic Delay**: When a high-level API fails or becomes sluggish, the symptoms manifest at the surface level (e.g., HTTP 500 or 1,500ms API response time), hiding the true culprit deep within database locks or upstream microservices.
- **Cascading Blindness**: In distributed architectures, one failure triggers domino effects. Traditional log tools display hundreds of secondary error messages, confusing developers about where the incident actually initiated.
- **Manual Overhead**: Developers must manually execute query profilers, analyze CPU metrics, and correlate timestamps across isolated log stores.

### 2.2 Objectives & Key Results (OKRs)
1. **Automated Anomaly Detection**: Automatically detect metric deviations (latency spikes, HTTP error surges, CPU saturation) within 3 seconds of failure occurrence.
2. **Intelligent Root-Cause Identification**: Accurately isolate the initiating root cause (e.g., Database Query Degradation vs. External API Failure) with >90% confidence by analyzing event sequence timelines.
3. **Real-Time Visibility**: Broadcast live metrics and incident alerts to a web dashboard using **SignalR** without requiring browser refreshes.
4. **Controlled Experimentation**: Provide an interactive Chaos Engineering panel capable of simulating 4 core failure modes: Database Slowdown, Traffic Spike, API Failure, and Cascading Failure.

---

## 3. Technology Stack & Component Architecture

### 3.1 Technology Stack
| Layer / Component | Technology Selected | Purpose / Rationale |
| :--- | :--- | :--- |
| **Core Framework** | C# / .NET 8 / ASP.NET Core | High-performance application host, Web API, and background hosted services. |
| **Persistence / Memory** | SQL Server + Entity Framework Core | Stores business data, raw request logs, system metrics, incident history, and evidence. |
| **Real-Time Communication**| ASP.NET Core SignalR | Pushes live metric charts, status indicators, and incident notifications to the dashboard UI. |
| **Frontend / Dashboard** | HTML5, CSS3 (Vanilla / Custom Dark Mode), JavaScript (ES6+), Chart.js | Responsive, interactive monitoring dashboard, simulation control panel, and incident drill-down UI. |
| **AI / RCA Engine** | C# Rule/Statistical Engine + AI Heuristic Correlator (Optional Python/ML extension) | Calculates statistical baseline metrics, detects anomaly thresholds, correlates time-series cause-and-effect, and computes confidence scores. |
| **Simulation Services** | ASP.NET Core `IHostedService` / Background Workers | Generates synthetic virtual user traffic and injects artificial latency/faults into the application pipeline. |

### 3.2 High-Level Architecture Diagram
```
 +-----------------------------------------------------------------------------------+
 |                                INCIDENTIQ PLATFORM                                |
 |                                                                                   |
 |  +--------------------+         HTTP          +--------------------------------+  |
 |  |  Virtual Traffic   | --------------------> |    ShopEasy Target Application |  |
 |  |     Simulator      |                       |    (Users, Products, Orders,   |  |
 |  | (100 - 3000 RPM)   |                       |             Payments)          |  |
 |  +--------------------+                       +--------------------------------+  |
 |                                                               |                   |
 |                                              Telemetry        | Middleware &      |
 |                                              Capture          v EF Interceptors   |
 |  +--------------------+                       +--------------------------------+  |
 |  |  Failure Simulator | -- Inject Faults ---> |   System Metrics & Log Store   |  |
 |  | (DB, Traffic, API, |  (Latency/500/Slow)   |          (SQL Server)          |  |
 |  |     Cascading)     |                       +--------------------------------+  |
 |  +--------------------+                                       |                   |
 |                                                               v Telemetry Feed    |
 |  +-------------------------------------------------------------------------------+  |
 |  |                     AI INCIDENT COMMANDER (ENGINE)                            |  |
 |  |  - Statistical Baseline Comparator   - Anomaly Detection (Z-Score/Threshold)  |  |
 |  |  - Time-Series Event Correlator      - Root-Cause & Evidence Generator      |  |
 |  +-------------------------------------------------------------------------------+  |
 |                                                               |                   |
 |                                                               v Push Updates      |
 |  +-------------------------------------------------------------------------------+  |
 |  |                        REAL-TIME SIGNALR HUB & DASHBOARD                      |  |
 |  |  - Live Health Gauges  - Metric Line Charts  - Incident Feed  - RCA Details   |  |
 |  +-------------------------------------------------------------------------------+  |
 +-----------------------------------------------------------------------------------+
```

---

## 4. Functional Requirements (FR)

### 4.1 Module 1: ShopEasy Target Application (Core Business Logic)
- **FR-1.1**: The application shall implement an E-Commerce domain model featuring `Users`, `Products`, `Orders`, and `Payments`.
- **FR-1.2**: The application shall expose RESTful API endpoints:
  - `POST /api/auth/login` - User authentication and token/session creation.
  - `GET /api/products` - Product catalog listing with search/filter parameters.
  - `GET /api/products/{id}` - Detailed product information lookup.
  - `POST /api/orders` - Order placement involving database reads/writes.
  - `POST /api/payments` - Payment processing endpoint.
  - `GET /api/orders/{id}` - Order status query.

### 4.2 Module 2: Telemetry & Logging Middleware
- **FR-2.1**: The platform shall intercept all incoming HTTP requests via ASP.NET Core Middleware to capture:
  - Request Path, HTTP Method, HTTP Status Code.
  - Overall API Response Time (latency in ms).
  - Exception details and stack traces for 5xx errors.
  - Client IP and Timestamp.
- **FR-2.2**: The platform shall intercept database execution queries via Entity Framework Core `DbCommandInterceptor` / `DiagnosticListener` to record:
  - SQL Command text / Query identifier.
  - SQL Query Execution Time (ms).
  - Database connection pool state.
- **FR-2.3**: The telemetry subsystem shall capture system resource metrics (CPU Usage %, Memory Consumption %, Active Requests/min, Database Connection Count).
- **FR-2.4**: All telemetry metrics and application logs shall be persisted asynchronously to SQL Server in `SystemMetrics` and `ApplicationLogs` tables.

### 4.3 Module 3: Virtual User Traffic Simulator
- **FR-3.1**: The platform shall include a background traffic generator capable of simulating realistic user interactions without requiring human users.
- **FR-3.2**: The traffic generator shall support customizable operating modes:
  - **Normal Mode**: ~100 requests/minute.
  - **High Traffic Mode**: ~1,000 requests/minute.
  - **Extreme Mode**: ~3,000 requests/minute.
- **FR-3.3**: Virtual users shall execute randomized, realistic interaction flows (e.g., Login -> Search Products -> View Product Details -> Add to Cart -> Place Order -> Process Payment).

### 4.4 Module 4: Controlled Failure Simulator (Chaos Engineering Panel)
- **FR-4.1**: The platform shall provide an interactive control panel allowing administrators to inject 4 distinct failure scenarios:
  1. **Failure 1 - Database Slowdown**: Artificially inflates SQL query execution time from normal (~80ms) to severe latency (~1,500ms - 2,500ms).
  2. **Failure 2 - Traffic Spike**: Triggers a sudden burst of requests up to 3,000+ requests/minute to test system capacity limits.
  3. **Failure 3 - API Failure**: Injects forced HTTP 500 Internal Server Errors into the `POST /api/payments` endpoint (e.g., 80% failure rate).
  4. **Failure 4 - Cascading Failure**: Injects a database delay that sequentially degrades the Order API, causing website slowdowns and widespread downstream request failures.
- **FR-4.2**: The failure simulator shall allow resetting the system back to **Normal** state instantly.

### 4.5 Module 5: AI Anomaly Detection & Root-Cause Analysis (RCA) Engine
- **FR-5.1**: **Baseline Evaluation**: The AI engine shall compute moving historical averages for normal operation:
  - Normal SQL Latency: 80ms - 120ms.
  - Normal API Latency: 100ms - 150ms.
  - Normal Error Rate: 0 - 3 errors/minute.
- **FR-5.2**: **Anomaly Detection**: The engine shall continuously evaluate incoming 5-second telemetry windows. If current metrics deviate significantly from baseline thresholds (e.g., SQL Latency > 500ms or Error Rate > 15/min), an **Incident** state is triggered.
- **FR-5.3**: **Time-Series Cause-and-Effect Correlation**: The engine shall inspect the precise temporal order of metric degradation.
  - *Example*: If SQL Latency spiked at 14:21:05 and API Latency spiked at 14:21:07, the engine identifies the Database as the primary cause rather than the API.
- **FR-5.4**: **RCA Output Generation**: For every detected incident, the AI engine shall construct an incident record containing:
  - Incident ID & Timestamp.
  - Incident Type (e.g., Database Performance Degradation, Traffic Overload, Payment Service Failure).
  - Severity Rating (LOW, MEDIUM, HIGH, CRITICAL).
  - Confidence Score percentage (e.g., 91%).
  - Chronological Evidence Breakdown.
  - Prescriptive Recommended Action for developers.

### 4.6 Module 6: Real-Time Monitoring & Incident Dashboard
- **FR-6.1**: The dashboard shall maintain an active SignalR connection to render live telemetry updates without page reloads.
- **FR-6.2**: **Global System Status Indicator**: Prominently display system health as **HEALTHY** (Green) or **INCIDENT DETECTED** (Red/Alert).
- **FR-6.3**: **Live Telemetry Charts**: Real-time line/gauge graphs displaying API Response Time, SQL Execution Time, Requests/Min, Error Rates, and CPU/Memory usage.
- **FR-6.4**: **Incident List View**: Filterable display of active and historical incidents showing ID, Type, Severity, Status, and Timestamp.
- **FR-6.5**: **Incident Detail View**: Dedicated forensic view presenting:
  - Incident Summary & Status.
  - Chronological timeline of metric degradation.
  - AI Root Cause diagnosis.
  - Structured evidence points (e.g., "SQL latency increased 4s prior to API response degradation").
  - Recommended developer action (e.g., "Investigate missing index on Orders table").
- **FR-6.6**: **Logs & Metrics Inspector**: Raw log viewer allowing engineers to inspect the exact data fed into the AI engine.
- **FR-6.7**: **Analytical Reports**: Visual breakdown of total incidents, categorization by type, and overall AI detection accuracy.

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance & Overhead
- **NFR-1.1**: The telemetry logging middleware must add less than **5ms** of latency to normal application HTTP request processing.
- **NFR-1.2**: SignalR real-time metric updates must be pushed to connected dashboard clients within **1 second** of generation.
- **NFR-1.3**: The AI Anomaly Detection engine must complete evaluation of telemetry windows within **2 seconds**.

### 5.2 Reliability & Fault Isolation
- **NFR-2.1**: Simulated application failures or chaos injections must not crash the monitoring system or telemetry collector.
- **NFR-2.2**: Database write failures in the logging pipeline must fail gracefully without disrupting core E-Commerce business transactions.

### 5.3 Usability & Aesthetics
- **NFR-3.1**: The user interface shall feature a modern, dark-mode technical aesthetic with color-coded severity indicators (Green = Healthy, Yellow = Warning, Red = Critical Incident).
- **NFR-3.2**: Navigation between Dashboard, Live Monitoring, Incidents, Simulations, and Reports must require no more than 1 click.

### 5.4 Maintainability & Extensibility
- **NFR-4.1**: The application code shall adhere to Clean Architecture principles, cleanly separating Core Domain, Infrastructure, Telemetry Middleware, AI Services, and Web Presentation.

---

## 6. Data Models & Database Schema Design

### 6.1 Database ERD Structure
```
 [Users] --------< [Orders] >-------- [Payments]
                      |
                      v
              [OrderItems] >-------- [Products]

 [SystemMetrics]      [ApplicationLogs]      [Incidents] --------< [IncidentEvidence]
```

### 6.2 Data Dictionary

#### 1. `Users`
- `UserId` (INT, PK, Identity)
- `Username` (NVARCHAR(100), NOT NULL)
- `Email` (NVARCHAR(150), NOT NULL)
- `CreatedAt` (DATETIME2, DEFAULT GETUTCDATE())

#### 2. `Products`
- `ProductId` (INT, PK, Identity)
- `Name` (NVARCHAR(200), NOT NULL)
- `Price` (DECIMAL(18,2), NOT NULL)
- `StockQuantity` (INT, NOT NULL)

#### 3. `Orders`
- `OrderId` (INT, PK, Identity)
- `UserId` (INT, FK to Users)
- `TotalAmount` (DECIMAL(18,2), NOT NULL)
- `Status` (NVARCHAR(50), NOT NULL)
- `CreatedAt` (DATETIME2, DEFAULT GETUTCDATE())

#### 4. `Payments`
- `PaymentId` (INT, PK, Identity)
- `OrderId` (INT, FK to Orders)
- `Amount` (DECIMAL(18,2), NOT NULL)
- `PaymentMethod` (NVARCHAR(50))
- `Status` (NVARCHAR(50)) -- Success, Failed
- `CreatedAt` (DATETIME2)

#### 5. `SystemMetrics` (Telemetry Data)
- `MetricId` (BIGINT, PK, Identity)
- `Timestamp` (DATETIME2, INDEXED)
- `ApiLatencyMs` (DOUBLE, NOT NULL)
- `SqlLatencyMs` (DOUBLE, NOT NULL)
- `RequestsPerMin` (INT, NOT NULL)
- `ErrorCountPerMin` (INT, NOT NULL)
- `CpuUsagePercentage` (DOUBLE, NOT NULL)
- `MemoryUsagePercentage` (DOUBLE, NOT NULL)
- `ActiveDbConnections` (INT, NOT NULL)

#### 6. `ApplicationLogs` (Request & Execution Logs)
- `LogId` (BIGINT, PK, Identity)
- `Timestamp` (DATETIME2, INDEXED)
- `RequestMethod` (NVARCHAR(10))
- `RequestPath` (NVARCHAR(250))
- `StatusCode` (INT, NOT NULL)
- `ResponseTimeMs` (DOUBLE, NOT NULL)
- `SqlTimeMs` (DOUBLE, NOT NULL)
- `ErrorMessage` (NVARCHAR(MAX), NULL)

#### 7. `Incidents`
- `IncidentId` (INT, PK, Identity)
- `IncidentNumber` (NVARCHAR(20), UNIQUE) -- e.g. #1024
- `Title` (NVARCHAR(200), NOT NULL)
- `IncidentType` (NVARCHAR(100), NOT NULL) -- DB_SLOWDOWN, TRAFFIC_SPIKE, API_FAILURE, CASCADING_FAILURE
- `Severity` (NVARCHAR(20), NOT NULL) -- LOW, MEDIUM, HIGH, CRITICAL
- `Status` (NVARCHAR(30), NOT NULL) -- ACTIVE, INVESTIGATING, RESOLVED
- `DetectedAt` (DATETIME2, NOT NULL)
- `ResolvedAt` (DATETIME2, NULL)
- `ConfidencePercentage` (DOUBLE, NOT NULL)
- `RootCauseSummary` (NVARCHAR(MAX), NOT NULL)
- `RecommendedAction` (NVARCHAR(MAX), NOT NULL)

#### 8. `IncidentEvidence`
- `EvidenceId` (INT, PK, Identity)
- `IncidentId` (INT, FK to Incidents)
- `SequenceOrder` (INT, NOT NULL)
- `Timestamp` (DATETIME2, NOT NULL)
- `MetricName` (NVARCHAR(100), NOT NULL)
- `ObservedValue` (NVARCHAR(100), NOT NULL)
- `BaselineValue` (NVARCHAR(100), NOT NULL)
- `Description` (NVARCHAR(500), NOT NULL)

---

## 7. System Constraints & Future Assumptions

1. **Environment**: Primary deployment targets local development or demo servers running .NET 8 runtime and Microsoft SQL Server (LocalDB or Docker SQL Server).
2. **AI Implementation Strategy**: The core engine uses a deterministic statistical baseline algorithm (Z-score drift detection + temporal sequence graph analysis) in C# for sub-second, reliable evaluation, with an optional Python ML/LLM integration endpoint for extended natural language explanations.
3. **Simulated Scale**: Synthetic traffic generation is capped at ~3,000 requests/minute to fit standard laptop/developer machine hardware without requiring cloud load-testing infrastructure.
