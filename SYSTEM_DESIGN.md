# IncidentIQ - Enterprise System Design Specification

## 1. Executive Summary & Architecture Overview

**IncidentIQ** is an enterprise-grade telemetry monitoring, fault simulation, and automated root-cause analysis (RCA) engine built on **.NET 8** and **Microsoft SQL Server 2022**.

The platform integrates a target commercial e-commerce micro-service (**ShopEasy**) with an **AI Incident Commander Engine**. Non-blocking middleware, Entity Framework Core interceptors, async channel queues, and distributed resilience policies capture telemetry data and evaluate anomaly sequences in real time without impacting business transaction throughput.

```
 +-----------------------------------------------------------------------------------+
 |                        INCIDENTIQ ENTERPRISE ARCHITECTURE                         |
 +-----------------------------------------------------------------------------------+
 |                                                                                   |
 |  +--------------------+   HTTP Traffic    +------------------------------------+  |
 |  |  Synthetic Traffic | ----------------> |  ShopEasy Core Application (API)   |  |
 |  |     Simulator      |  (100 - 3000 RPM) |  - Rate Limiting Middleware        |  |
 |  |                    |                   |  - JWT Bearer & RBAC Authorization |  |
 |  +--------------------+                   |  - Redis Catalog Distributed Cache |  |
 |                                           +------------------------------------+  |
 |                                                             |                     |
 |                                            Telemetry Intercept middleware         |
 |                                                             v                     |
 |  +--------------------+    Fault Inject   +------------------------------------+  |
 |  |  Chaos Simulator   | ----------------> | System.Threading.Channels Queue    |  |
 |  | (DB, Traffic, API, | (Latency/500/Slow)| (Async Non-blocking Buffer Queue)   |  |
 |  |     Cascading)     |                   +------------------------------------+  |
 |  +--------------------+                                     | Batch Persistence   |
 |                                                             v (SqlBulkCopy)       |
 |                                           +------------------------------------+  |
 |                                           |  SQL Server (Partitioned Telemetry)|  |
 |                                           +------------------------------------+  |
 |                                                             | Telemetry Stream    |
 |                                                             v                     |
 |  +--------------------------------------------------------------------------------+  |
 |  |                      AI INCIDENT COMMANDER (ENGINE)                            |  |
 |  |  - Statistical Z-Score Drift         - Moving Baseline Aggregation Matrix      |  |
 |  |  - Temporal Event Correlation Graph  - Evidence Chain & Prescriptive Remediation|  |
 |  +--------------------------------------------------------------------------------+  |
 |                                                             | Real-Time Broadcast |
 |                                                             v                     |
 |  +--------------------------------------------------------------------------------+  |
 |  |                      SWAGGER OPENAPI & SIGNALR CLIENTS                         |  |
 |  |  - Interactive OpenAPI Explorer      - WebSockets Live Telemetry Stream Feed   |  |
 |  +--------------------------------------------------------------------------------+  |
 +-----------------------------------------------------------------------------------+
```

---

## 2. Layer Boundaries & Component Architecture (`Clean Architecture`)

```
  IncidentIQ.WebApi (API Controllers, SignalR Hub, Rate Limiting, OpenAPI, Auth)
         │
         ├──> IncidentIQ.Infrastructure (AppDbContext, EF Interceptors, Channel Workers, Redis Cache)
         │           │
         │           └──> IncidentIQ.Application (DTOs, Use Cases, AI Engines, Simulator Interfaces)
         │                       │
         └───> ───> ───> ───> IncidentIQ.Domain (Pure Entities, Enums, Zero External Dependencies)
```

1. **`IncidentIQ.Domain`**: Pure C# domain model entities (`User`, `Product`, `Order`, `Payment`, `SystemMetric`, `ApplicationLog`, `Incident`, `IncidentEvidence`) with domain invariants and enums.
2. **`IncidentIQ.Application`**: Use cases, DTO contracts, simulator interfaces (`ITrafficSimulatorService`, `IFailureSimulationManager`), and AI engine contracts (`IAnomalyDetectionEngine`, `IRootCauseAnalysisEngine`).
3. **`IncidentIQ.Infrastructure`**: SQL Server `AppDbContext`, Entity Framework Core query interceptors (`EfQueryInterceptor`), `System.Threading.Channels` telemetry buffer, `SqlBulkCopy` batch writers, and Redis distributed caching.
4. **`IncidentIQ.WebApi`**: ASP.NET Core REST API controllers, SignalR `TelemetryHub`, Rate Limiter policies, JWT Bearer authentication, and Swagger OpenAPI generation.

---

## 3. Subsystem Detailed Design

### 3.1 Non-Blocking Telemetry Collection & Async Producer-Consumer Queue

To guarantee $< 5\text{ ms}$ request overhead under heavy traffic surges (up to 3,000 RPM):

1. **`TelemetryCollectorMiddleware`**:
   - Captures HTTP Request Metadata (`Method`, `Path`, `StatusCode`, `ResponseTimeMs`, `TraceId`).
   - Reads OpenTelemetry `W3C TraceContext` (`traceparent` header) for distributed request tracing.
   - Pushes telemetry items into an in-memory `System.Threading.Channels.Channel<ApplicationLog>` buffer.
2. **Background Batch Worker (`TelemetryBatchWorker`)**:
   - Reads from the channel queue asynchronously.
   - Flushes batch logs to SQL Server every $500\text{ ms}$ or when batch size hits 100 items using optimized `SqlBulkCopy` / EF Core batching.

### 3.2 Resilience, Caching & Rate Limiting Subsystem

1. **Redis Distributed Caching (`IDistributedCache`)**:
   - Caches `GET /api/products` catalog responses with sliding expiration.
   - Shields SQL Server database connection pools during severe traffic spikes.
2. **ASP.NET Core Rate Limiting**:
   - Protects ShopEasy APIs with a Sliding Window rate limiting policy ($100\text{ requests / minute / IP}$).
   - Returns standard HTTP 429 Too Many Requests when limits are breached.
3. **Polly Resiliency Policies**:
   - **SQL Server Connection Retry**: Configured with `EnableRetryOnFailure()` and exponential backoff ($2\text{s}, 4\text{s}, 8\text{s}$).
   - **Payment Gateway Circuit Breaker**: Wraps external payment API invocations. Breaks circuit if error rate exceeds $50\%$ over 10 seconds.

---

### 3.3 Chaos Failure Simulator (4 Reproducible Scenarios)

| Scenario | Trigger Mechanism | Symptom Sequence | AI Engine Diagnosis |
| :--- | :--- | :--- | :--- |
| **1. DB Slowdown** | EF Query Interceptor injects 1,500ms delay in SQL commands. | SQL query latency spikes at $T_0 \rightarrow$ API response latency degrades at $T_0 + 2\text{s}$. | *Database Performance Degradation / Query Execution Latency* |
| **2. Traffic Spike** | Synthetic generator surges throughput to 3,000 RPM. | Request volume surges by $>800\% \rightarrow$ CPU saturates at $>85\% \rightarrow$ Request queue latency rises. | *Traffic Overload / Hardware Resource Saturation* |
| **3. API Failure** | Payment API endpoint forced to return HTTP 500. | Error rate surges on `POST /api/payments` while SQL latency remains normal ($82\text{ms}$). | *Payment Gateway / External API Failure* |
| **4. Cascading Failure** | SQL delay combined with payment timeout. | SQL query delay $\rightarrow$ Thread pool queue exhaustion $\rightarrow$ Payment timeout $\rightarrow$ HTTP 500 error wave. | *Cascading System Failure Initiated by Database Latency* |

---

### 3.4 AI-Assisted Time-Series RCA Engine

The RCA Engine evaluates system stability deterministically via moving statistical baselines ($Z$-Score drift) combined with a temporal event sequence graph:

$$\text{Z-Score} = \frac{X - \mu}{\sigma}$$

- **Evaluation Window**: 5-second sampling interval with 30-second rolling baseline window ($\mu, \sigma$).
- **Correlation Graph**: Traces metric timestamp offsets to establish true causal origin ($A \rightarrow B$) vs downstream symptoms.
- **Confidence Scoring**: Evaluates sample size, standard deviation multiplier ($Z > 3.0$), and temporal precedence.

---

## 4. System Security & Authentication Architecture

1. **JWT Bearer Authentication (`JwtBearerDefaults`)**:
   - Generates cryptographically signed JWT tokens upon successful `POST /api/auth/login`.
2. **Role-Based Access Control (RBAC)**:
   - `Customer`: Can view products, place orders, and make payments.
   - `Admin`: Can trigger chaos simulation scenarios (`POST /api/simulation/command`) and view internal telemetry graphs (`GET /api/incidents/metrics`).
3. **Password Security**:
   - Uses PBKDF2 hashing with unique cryptographic salt per user account.

---

## 5. Non-Functional Requirements & Performance Budget

- **Telemetry Processing Overhead**: $< 5\text{ ms}$ added latency per HTTP request.
- **Real-Time SignalR WebSockets Push**: $< 1\text{ second}$ latency from anomaly detection to client broadcast.
- **AI RCA Evaluation Cycle**: $< 2\text{ seconds}$ detection latency following failure injection.
- **System Availability & Resilience**: Failure injections never crash application host processes, SQL Server connection pools, or background telemetry workers.
