# 👥 IncidentIQ & ShopEasy — 7-Member Work Division & Project Assignment Guide (Phase 2)

> **Project Name:** IncidentIQ (Autonomous AI Observability Platform & Root-Cause Engine)  
> **Monitored Target App:** Standalone ShopEasy E-Commerce Core (Port 5001)  
> **Team Size:** 7 Members  
> **Submission Purpose:** Academic / Project Viva Work Allocation Document  

---

## 📌 Executive Work Distribution Matrix

| Member # | Member Name | Assigned Role | Primary Responsibilities | Code File Ownership |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **Anand Singh** *(Lead)* | **System Architect & Team Lead** | System Design, Decoupled 2-App Architecture (Ports 5000 & 5001), CORS & Ingestion Middleware, End-to-End Pipeline | `Program.cs`, `TelemetryCollectorMiddleware.cs`, `ConnectedApplicationsCard.tsx`, `vite.config.ts` |
| **Member 2** | **Pavi Gupta** | **Backend & Database Engineer** | SQL Server 2022 Docker setup, EF Core 8 DbContext, DDL Auto-Migrations, Data Seeding | `AppDbContext.cs`, `DbInitializer.cs`, `MonitoredApplication.cs`, `database/001_initial_schema.sql` |
| **Member 3** | **Shoutrik Sanyal** | **Frontend Lead & UI/UX Engineer** | React 18 SPA Architecture, SRE Dashboards, APM Flame Graphs, Recharts Visualizations | `App.tsx`, `Sidebar.tsx`, `Header.tsx`, `DistributedTracingView.tsx`, `TracingWaterfallGraph.tsx`, `TopologyDagMap.tsx` |
| **Member 4** | **Aditya Verma** | **Target App Lead (ShopEasy Port 5001)** | Standalone ShopEasy Storefront, Indian Rupee Pricing (₹), Cart Drawer, Order Checkout API, Reviews & Coupon Engine | `ShopEasyStorefront.tsx`, `ShopEasyContext.tsx`, `ShopEasyCartDrawer.tsx`, `ShopEasyReviewsSection.tsx`, `ShopEasyCouponEngineModal.tsx`, `ShopEasyComparisonModal.tsx` |
| **Member 5** | **Mayank Singh** | **SRE Observability, Distributed Tracing & APM Engineer** | Distributed Tracing Engine, W3C TraceContext Propagator, Telemetry Ingestion Controller, EF Query Interceptor | `DistributedTracingEngine.cs`, `DistributedTracingController.cs`, `TelemetryIngestionController.cs`, `SystemMetricsWorker.cs`, `EfQueryInterceptor.cs` |
| **Member 6** | **Harshit Gupta** | **Security Audit, Chaos Laboratory & Benchmark Specialist** | OWASP Security Vulnerability Audit, Synthetic Load Benchmark Suite, Chaos Failure Simulation Manager | `SecurityAuditEngine.cs`, `PerformanceBenchmarkEngine.cs`, `FailureSimulationManager.cs`, `SecurityAuditView.tsx`, `PerformanceBenchmarkView.tsx`, `VulnerabilityCard.tsx` |
| **Member 7** | **Urjarshi Nandy** | **AI Root-Cause Analysis, SLO & Auto-Remediation Specialist** | Google Gemini AI Advisor, Predictive Anomaly Model, SRE Error Budgets, Automated Remediation Playbooks, Post-Mortem Generator | `GeminiAiAdvisorService.cs`, `PredictiveAnomalyModel.cs`, `AutomatedRemediationEngine.cs`, `RemediationPlaybooksController.cs`, `SreMetricsSloController.cs`, `ExportReportController.cs`, `ExecutivePostMortemView.tsx` |

---

## 🛠️ Detailed Individual Work Breakdown & Code Ownership

### 👤 Member 1: System Architect & Team Lead *(Anand Singh)*
* **Key Deliverables**:
  - Designed the decoupled 2-application architecture separating the **IncidentIQ Observability Control Plane (`http://localhost:5000`)** from the **Standalone ShopEasy E-Commerce App (`http://localhost:5001`)**.
  - Implemented cross-origin CORS policy and `TelemetryCollectorMiddleware` in ASP.NET Core Web API.
  - Built `ConnectedApplicationsCard.tsx` for registering new external web applications using internal server API keys.
* **Code Files Owned**:
  - `src/IncidentIQ.WebApi/Program.cs`
  - `src/IncidentIQ.Infrastructure/Services/TelemetryCollectorMiddleware.cs`
  - `frontend/src/components/ConnectedApplicationsCard.tsx`
  - `frontend/vite.config.ts`
* **Viva Question for Member 1**:
  - *Ma'am Question*: "How are the two applications connected and how does IncidentIQ monitor ShopEasy?"
  - *Answer*: *"IncidentIQ runs on Port 5000 as an independent observability control plane. ShopEasy runs on Port 5001 as a standalone web application. Whenever users interact on ShopEasy, its telemetry handler dispatches cross-origin HTTP POST requests to `/api/telemetry/ingest` on Port 5000 using an API Key."*

---

### 👤 Member 2: Backend & Database Engineer *(Pavi Gupta)*
* **Key Deliverables**:
  - Configured Microsoft SQL Server 2022 in Docker container (`127.0.0.1:1433`).
  - Created Entity Framework Core 8 `AppDbContext` mapping entities (`MonitoredApplications`, `MonitoredEndpoints`, `ApplicationLogs`, `SystemMetrics`, `Incidents`, `Products`, `Orders`, `Users`).
  - Implemented `DbInitializer` for automatic DDL table creation and initial dataset seeding.
* **Code Files Owned**:
  - `src/IncidentIQ.Infrastructure/Data/AppDbContext.cs`
  - `src/IncidentIQ.Infrastructure/Data/DbInitializer.cs`
  - `src/IncidentIQ.Domain/Entities/MonitoredApplication.cs`
  - `src/IncidentIQ.Domain/Entities/MonitoredEndpoint.cs`
  - `database/001_initial_schema.sql`
* **Viva Question for Member 2**:
  - *Ma'am Question*: "How does the backend ensure new database tables like `MonitoredApplications` are created automatically?"
  - *Answer*: *"We added automated `IF NOT EXISTS` DDL SQL migration scripts inside `DbInitializer.cs`. When ASP.NET Core starts up, `DbInitializer.Initialize()` checks SQL Server information schemas and executes table DDL statements if they are missing."*

---

### 👤 Member 3: Frontend Lead & UI/UX Engineer *(Shoutrik Sanyal)*
* **Key Deliverables**:
  - Built the React 18 Single Page Application with TypeScript.
  - Implemented the enterprise APM interface including Flame Graphs, Microservice DAG maps, and Waterfall Timelines.
  - Designed the responsive sidebar navigation and Recharts telemetry visualization cards.
* **Code Files Owned**:
  - `frontend/src/App.tsx`
  - `frontend/src/components/Sidebar.tsx`
  - `frontend/src/components/Header.tsx`
  - `frontend/src/views/DistributedTracingView.tsx`
  - `frontend/src/components/TracingWaterfallGraph.tsx`
  - `frontend/src/components/TopologyDagMap.tsx`
* **Viva Question for Member 3**:
  - *Ma'am Question*: "How does the Distributed Tracing view visualize microservice request latencies?"
  - *Answer*: *"The view fetches trace DAG data from `/api/tracing/dag`. It renders a node-edge graph (`TopologyDagMap`) showing inter-service HTTP/SQL protocols and a waterfall timeline (`TracingWaterfallGraph`) displaying start times, durations, and HTTP status codes."*

---

### 👤 Member 4: Target Application Lead *(Aditya Verma — ShopEasy Port 5001)*
* **Key Deliverables**:
  - Developed the standalone **ShopEasy E-Commerce Storefront (`http://localhost:5001`)** with Indian Rupee pricing (`₹`).
  - Implemented shopping cart state, wishlist drawer, product spec comparison modal, active promo coupon vault (`WELCOME10`, `FESTIVE20`), and verified customer review section.
  - Created live stock reservation timer and SSL trust security badges.
* **Code Files Owned**:
  - `ShopEasyApp/src/components/ShopEasyStorefront.tsx`
  - `ShopEasyApp/src/context/ShopEasyContext.tsx`
  - `ShopEasyApp/src/components/ShopEasyCartDrawer.tsx`
  - `ShopEasyApp/src/components/ShopEasyReviewsSection.tsx`
  - `ShopEasyApp/src/components/ShopEasyCouponEngineModal.tsx`
  - `ShopEasyApp/src/components/ShopEasyComparisonModal.tsx`
  - `ShopEasyApp/src/components/ShopEasySecurityBadge.tsx`
* **Viva Question for Member 4**:
  - *Ma'am Question*: "How does user activity in ShopEasy feed telemetry into IncidentIQ?"
  - *Answer*: *"In `ShopEasyContext.tsx`, actions like adding items to cart or placing orders invoke `sendTelemetryToIncidentIQ()`. This dispatches an HTTP POST payload containing HTTP method, request path, response time, and trace ID to `http://localhost:5000/api/telemetry/ingest`."*

---

### 👤 Member 5: SRE Observability, Distributed Tracing & APM Engineer *(Mayank Singh)*
* **Key Deliverables**:
  - Developed `DistributedTracingEngine.cs` generating W3C TraceContext spans and flame graphs.
  - Built `TelemetryIngestionController.cs` for logging remote telemetry events and filtering log streams for connected target apps.
  - Implemented `EfQueryInterceptor.cs` and `SystemMetricsWorker.cs` for SQL latency and system metric collection.
* **Code Files Owned**:
  - `src/IncidentIQ.Application/Engine/DistributedTracingEngine.cs`
  - `src/IncidentIQ.WebApi/Controllers/DistributedTracingController.cs`
  - `src/IncidentIQ.WebApi/Controllers/TelemetryIngestionController.cs`
  - `src/IncidentIQ.Infrastructure/HostedServices/SystemMetricsWorker.cs`
  - `src/IncidentIQ.Infrastructure/Interceptors/EfQueryInterceptor.cs`
  - `frontend/src/views/LogsMetricsView.tsx`
* **Viva Question for Member 5**:
  - *Ma'am Question*: "How are external logs filtered so only connected application entries appear?"
  - *Answer*: *"In `TelemetryIngestionController.cs`, `GetLiveTelemetryLogs()` filters the log buffer by route matching (`/api/shopeasy`, `/api/orders`, `/api/cart`), excluding internal IncidentIQ control plane endpoints to keep the log stream focused on connected target apps."*

---

### 👤 Member 6: Security Audit, Chaos Laboratory & Benchmark Specialist *(Harshit Gupta)*
* **Key Deliverables**:
  - Developed `SecurityAuditEngine.cs` for OWASP Top 10 vulnerability scanning, PII data leakage auditing, and SOC2 / ISO 27001 compliance grading (`A+`, `A`, `B`, `C`).
  - Created `PerformanceBenchmarkEngine.cs` for synthetic load testing (`100 RPM`, `1,000 RPM`, `3,000 RPM`) and P50–P99.9 percentile latency estimations.
  - Maintained `FailureSimulationManager.cs` for synthetic chaos fault injection.
* **Code Files Owned**:
  - `src/IncidentIQ.Application/Engine/SecurityAuditEngine.cs`
  - `src/IncidentIQ.Application/Engine/PerformanceBenchmarkEngine.cs`
  - `src/IncidentIQ.Infrastructure/Services/FailureSimulationManager.cs`
  - `src/IncidentIQ.WebApi/Controllers/SecurityAuditController.cs`
  - `src/IncidentIQ.WebApi/Controllers/PerformanceBenchmarkController.cs`
  - `frontend/src/views/SecurityAuditView.tsx`
  - `frontend/src/views/PerformanceBenchmarkView.tsx`
  - `frontend/src/components/VulnerabilityCard.tsx`
  - `frontend/src/components/LatencyHistogramChart.tsx`
* **Viva Question for Member 6**:
  - *Ma'am Question*: "How does the security engine calculate compliance scores?"
  - *Answer*: *"The engine audits target endpoints against OWASP threat signatures (SQL injection patterns, permissive CORS, unredacted PII). It deducts points per open vulnerability, assigning an overall percentage score and letter grade (A+, A, B, C)."*

---

### 👤 Member 7: AI Root-Cause Analysis, SLO & Auto-Remediation Specialist *(Urjarshi Nandy)*
* **Key Deliverables**:
  - Integrated Google Gemini AI Advisor (`GeminiAiAdvisorService.cs`) via API key for automated incident root-cause analysis.
  - Implemented `PredictiveAnomalyModel.cs` for Holt-Winters forecasting and SRE SLO error budget tracking (99.99% availability).
  - Developed `AutomatedRemediationEngine.cs` for self-healing SRE playbooks (`pb-db-pool-flush`, `pb-api-rate-throttle`, `pb-memory-gc-recycle`) and `ExportReportController.cs` for AI post-mortem generation.
* **Code Files Owned**:
  - `src/IncidentIQ.Infrastructure/Services/GeminiAiAdvisorService.cs`
  - `src/IncidentIQ.Application/Engine/PredictiveAnomalyModel.cs`
  - `src/IncidentIQ.Application/Engine/AutomatedRemediationEngine.cs`
  - `src/IncidentIQ.WebApi/Controllers/RemediationPlaybooksController.cs`
  - `src/IncidentIQ.WebApi/Controllers/SreMetricsSloController.cs`
  - `src/IncidentIQ.WebApi/Controllers/ExportReportController.cs`
  - `frontend/src/views/SreSloManagementView.tsx`
  - `frontend/src/views/RemediationPlaybooksView.tsx`
  - `frontend/src/views/ExecutivePostMortemView.tsx`
* **Viva Question for Member 7**:
  - *Ma'am Question*: "How do automated remediation playbooks mitigate an active incident?"
  - *Answer*: *"When an incident occurs, `AutomatedRemediationEngine` triggers the corresponding playbook. For example, `pb-db-pool-flush` recycles active SQL connection pools, clears stale Redis cache keys, and verifies latency recovery automatically."*

---

## 📝 Official Member Work Allocation Table

```text
========================================================================================================
                 TEAM WORK ALLOCATION SHEET — INCIDENTIQ & SHOPEASY (PHASE 2)
========================================================================================================

Project Title: IncidentIQ — Autonomous AI Observability Platform & Monitored E-Commerce Target
Architecture: Decoupled 2-App System (Port 5000 Control Plane & Port 5001 Target App)
Technology Stack: ASP.NET Core 8, React 18, TypeScript, Docker SQL Server 2022, Recharts, Tailwind CSS

Member 1 (Anand Singh - Lead): System Architecture, Decoupled 2-App Pipeline & Middleware
Member 2 (Pavi Gupta): SQL Server Database Schemas, EF Core 8 DbContext & DDL Auto-Migrations
Member 3 (Shoutrik Sanyal): React 18 SPA Architecture, Distributed Tracing UI & APM Flame Graphs
Member 4 (Aditya Verma): Standalone ShopEasy Target App (Port 5001), Cart Drawer & Coupon Engine
Member 5 (Mayank Singh): SRE Observability Pipeline, W3C Distributed Tracing Engine & Telemetry APIs
Member 6 (Harshit Gupta): OWASP Security Audit Engine, Synthetic Load Benchmarks & Chaos Laboratory
Member 7 (Urjarshi Nandy): Google Gemini AI Advisor, SRE Error Budgets & Automated Remediation Playbooks
========================================================================================================
```
