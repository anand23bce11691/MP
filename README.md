# IncidentIQ Platform & ShopEasy E-Commerce Core

IncidentIQ is an autonomous AI-driven observability and root-cause analysis (RCA) platform integrated with a high-throughput target commercial microservice (**ShopEasy E-Commerce Core**) and a grounded conversational shopping assistant (**Aura AI**).

---

## Architecture Overview

```mermaid
flowchart TB
    subgraph ClientTier["Client Layer (React 19, TypeScript, TailwindCSS)"]
        Storefront["ShopEasy Storefront UI\n- Catalog Grid & Multi-Filter\n- Specification Inspection Modal\n- Wishlist & Order History"]
        AuraAI["Aura AI Shopping Concierge\n- Catalog Grounding Engine\n- Constraint & Budget Reasoning\n- Side-by-Side Comparison"]
        Cart["Cart & Checkout Engine\n- Promotional Coupon Rules\n- Multi-Payment Integration\n- Client-Side State Persistence"]
        ObservabilityUI["IncidentIQ SRE Dashboard\n- Real-Time Latency Streams\n- Incident Root-Cause Reports\n- Chaos Fault Injection Lab"]
    end

    subgraph ApiTier["Application Layer (.NET 8 Web API)"]
        ProdCtrl["/api/products\n(ProductsApiController)"]
        OrderCtrl["/api/orders\n(OrdersApiController)"]
        PayCtrl["/api/payments\n(PaymentsApiController)"]
        SimCtrl["/api/simulation\n(SimulationApiController)"]
        MonCtrl["/api/monitoring/ingest\n(MonitoringController)"]
        
        MW["TelemetryCollectorMiddleware"]
        Interceptor["EfQueryInterceptor"]
        Hub["SignalR TelemetryHub"]
    end

    subgraph AIAndRcaEngine["Intelligence & Simulation Layer"]
        AnomalyEngine["AnomalyDetectionEngine\n(P95 Latency & Statistical Drift)"]
        RCAEngine["RootCauseAnalysisEngine\n(Evidence Chain Correlation)"]
        TrafficSim["TrafficSimulatorService\n(Virtual User Traffic)"]
        ChaosManager["FailureSimulationManager\n(Fault Injection Engine)"]
    end

    subgraph DataTier["Persistence Layer (EF Core 8)"]
        SQLServer[("SQL Server 2022 / SQLite\n- Products Catalog\n- Orders & OrderItems\n- Payments & Users\n- TelemetryEvents & Incidents")]
    end

    Storefront -->|Catalog & Search Queries| ProdCtrl
    Cart -->|Order Transactions| OrderCtrl
    Cart -->|Payment Confirmations| PayCtrl
    AuraAI -->|Product Verification| ProdCtrl
    ObservabilityUI -->|Chaos Commands| SimCtrl
    ObservabilityUI <-->|WebSocket Real-Time Stream| Hub

    ProdCtrl --> Interceptor --> SQLServer
    OrderCtrl --> Interceptor --> SQLServer
    PayCtrl --> Interceptor --> SQLServer

    OrderCtrl -.->|HTTP Duration & Status| MW
    Interceptor -.->|SQL Query Execution Time| MW
    MW --> AnomalyEngine --> RCAEngine --> Hub
    TrafficSim --> OrderCtrl
    ChaosManager --> Interceptor
```

---

## Transaction & Telemetry Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Shopper / SRE Operator
    participant UI as ShopEasy Storefront
    participant AI as Aura AI Concierge
    participant OrderAPI as Orders API (/api/orders)
    participant Interceptor as EfQueryInterceptor
    participant DB as SQL Server (OrdersDb)
    participant Telemetry as TelemetryCollectorMiddleware
    participant RCA as IncidentIQ RCA Engine
    participant Monitor as Live Telemetry Stream

    Customer->>AI: Natural language query (e.g., "Find audio gear under INR 5,000")
    AI->>UI: Return verified catalog items with direct cart actions
    Customer->>UI: Add items, apply promo code (SAVE10), select payment method
    Customer->>UI: Submit checkout request
    
    UI->>OrderAPI: POST /api/orders (Line items, customer info, address)
    OrderAPI->>Interceptor: Execute DbCommand (INSERT Orders, UPDATE Stock)
    Interceptor->>DB: Open transaction and commit entity changes
    DB-->>Interceptor: Execution complete (8ms baseline / 1450ms under chaos lock)
    Interceptor-->>Telemetry: Report SQL execution latency
    OrderAPI-->>UI: 201 Created (OrderId, TotalAmount, TelemetryTraceId)
    
    OrderAPI-->>Telemetry: Report HTTP Status 201 & request duration
    Telemetry->>RCA: Evaluate metric drift against baseline
    RCA->>Monitor: Publish real-time sample & structured trace log
    UI-->>Customer: Display confirmation with Telemetry Trace ID
```

---

## Conversational Commerce Decision Engine

```mermaid
flowchart TD
    UserQuery["User Natural Language Input\n(e.g., 'Compare curved monitor and mechanical keyboard')"]
    
    subgraph AuraEngine["Aura AI Decision Core"]
        Parser["Intent & Entity Extraction\n- Budget Constraints\n- Category & Feature Extraction\n- Workload / Use-Case Classification"]
        CatalogFilter["Catalog Grounding & Stock Verification\n- Enforce price & inventory boundaries\n- Prevent hallucinated specifications"]
        ComparisonLogic{"Comparison Intent Detected?"}
        Ranker["Multi-Factor Ranking\n(Review Quality x Rating x Spec Relevance)"]
    end
    
    subgraph UIOutput["Client Presentation"]
        ChatResponse["Grounded Response Summary"]
        ProductCards["Structured Recommendation Cards\n- Specs, Price, Rating, Stock\n- Quick Add to Cart\n- Specification Drilldown"]
        SideBySide["Side-by-Side Comparison Matrix"]
    end

    UserQuery --> Parser --> CatalogFilter --> ComparisonLogic
    ComparisonLogic -->|Yes| SideBySide --> ChatResponse
    ComparisonLogic -->|No| Ranker --> ProductCards --> ChatResponse
    ChatResponse --> CartDirect["Direct Cart & Checkout Synchronization"]
```

---

## System Capabilities

### 1. ShopEasy E-Commerce Core
- **Curated Product Catalog:** Categorized inventory covering Audio, Peripherals, Displays, Wearables, Storage, Video, Accessories, Furniture, and Smart Home with high-resolution imagery and verified technical specifications.
- **Specification Drilldown Modal:** Detailed technical sheets, warranty badges, verified user review distributions, and instant purchase flows.
- **Wishlist Management:** Persistent client-side favorites management with one-click batch migration to active cart sessions.
- **Promotional Discount Engine:** Real-time discount calculations supporting promotional rules (`SAVE10`, `TECH20`, `FREESHIP`).
- **Multi-Method Checkout:** Support for Credit/Debit Cards, UPI / QR payments, Net Banking, and Cash on Delivery (COD) with automated GST calculation.
- **Order Tracking & Telemetry Link:** Post-purchase tracking connected directly to backend trace IDs for full observability correlation.

### 2. Aura AI Shopping Concierge
- **Strict Catalog Grounding:** Recommendations are constrained to real database records to prevent hallucination of pricing, specifications, or availability.
- **Constraint Resolution:** Automatic extraction and enforcement of budget limits, hardware categories, and use cases.
- **Comparative Analysis:** Structured side-by-side technical evaluation across catalog items.
- **Interactive UI Integration:** Direct cart addition and specification modal triggers from within the conversational interface.

### 3. IncidentIQ SRE Observability Platform
- **Telemetry Ingestion:** High-throughput telemetry collector supporting push telemetry (`POST /api/monitoring/ingest`) and EF Core middleware interception.
- **Chaos Laboratory:** Deterministic failure injection including database connection pool exhaustion, payment gateway outages (HTTP 500), traffic surges, and cascading multi-service failures.
- **Root-Cause Analysis Engine:** Statistical anomaly evaluation with confidence scoring, evidence chains, and suggested remediation procedures.

---

## Local Development and Deployment

### Prerequisites
- Node.js (v18 or higher) and npm
- .NET 8 SDK (for backend execution)

### 1. Frontend Setup (Development Server)
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

### 2. Frontend Production Build
```bash
cd frontend
npm run build
```
Builds the optimized production client bundle directly into `src/IncidentIQ.WebApi/wwwroot`.

### 3. Backend Execution (.NET Web API)
```powershell
dotnet run --project .\src\IncidentIQ.WebApi
```
The database model and default catalog are seeded automatically on first run.

### 4. Docker Deployment
```powershell
docker compose up --build
```
Access the containerized application at `http://localhost:8080`.

---

## API Specification

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve catalog items with filtering (`category`, `search`, `sort`, `minPrice`, `maxPrice`) |
| `GET` | `/api/products/{id}` | Retrieve individual product details and technical specifications |
| `POST` | `/api/products` | Create a new catalog product |
| `POST` | `/api/orders` | Submit customer order, decrement stock, and record telemetry |
| `GET` | `/api/orders` | Retrieve recent orders with associated line items and status |
| `GET` | `/api/orders/{id}` | Retrieve specific order details by ID |
| `POST` | `/api/payments` | Process virtual transaction settlement for an existing order |
| `POST` | `/api/monitoring/ingest` | Ingest external application telemetry events |
| `GET` | `/api/simulation/state` | Retrieve active chaos simulation states |
| `POST` | `/api/simulation/command` | Execute chaos fault injection or reset baselines |
