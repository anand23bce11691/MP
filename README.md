# IncidentIQ Platform & ShopEasy E-Commerce Core

> **IncidentIQ** is an autonomous AI observability and root-cause analysis (RCA) platform coupled with a high-throughput target e-commerce microservice (**ShopEasy E-Commerce Core**) and an intelligent conversational shopping concierge (**Aura AI**).

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph ClientTier["Frontend Layer (React 19 + Vite + TailwindCSS)"]
        Storefront["ShopEasy Storefront UI\n• Catalog Grid & Filters\n• Product Quick View & Specs\n• Wishlist & Order History"]
        AuraAI["Aura AI Shopping Concierge\n• Catalog Grounding\n• Budget & Spec Matching\n• Comparison Cards"]
        Cart["Cart & Checkout Engine\n• Promo Codes (SAVE10, TECH20)\n• Multi-Payment (Card, UPI, COD)\n• LocalStorage Persistence"]
        ObservabilityUI["IncidentIQ SRE Dashboard\n• Real-Time Latency Streams\n• Anomaly & Incident RCA\n• Chaos Laboratory"]
    end

    subgraph ApiTier[".NET 8 Web API Core Engine"]
        ProdCtrl["/api/products\n(ProductsApiController)"]
        OrderCtrl["/api/orders\n(OrdersApiController)"]
        PayCtrl["/api/payments\n(PaymentsApiController)"]
        SimCtrl["/api/simulation\n(SimulationApiController)"]
        MonCtrl["/api/monitoring/ingest\n(MonitoringController)"]
        
        MW["TelemetryCollectorMiddleware"]
        Interceptor["EfQueryInterceptor"]
        Hub["SignalR TelemetryHub"]
    end

    subgraph AIAndRcaEngine["AI & RCA Intelligence Layer"]
        AnomalyEngine["AnomalyDetectionEngine\n(P95 Latency & Metric Drift)"]
        RCAEngine["RootCauseAnalysisEngine\n(Bayesian Evidence Chain)"]
        TrafficSim["TrafficSimulatorService\n(Virtual User Load)"]
        ChaosManager["FailureSimulationManager\n(Fault Injection)"]
    end

    subgraph DataTier["Persistence Layer (EF Core 8)"]
        SQLServer[("SQL Server 2022 / SQLite\n• Products (15 Rich Catalog Items)\n• Orders & OrderItems\n• Payments & Users\n• Incidents & TelemetryEvents")]
    end

    Storefront -->|Browse & Filter| ProdCtrl
    Cart -->|POST /api/orders| OrderCtrl
    Cart -->|POST /api/payments| PayCtrl
    AuraAI -->|Catalog Grounding| ProdCtrl
    ObservabilityUI -->|Chaos Commands| SimCtrl
    ObservabilityUI <-->|WebSocket Real-Time Stream| Hub

    ProdCtrl --> Interceptor --> SQLServer
    OrderCtrl --> Interceptor --> SQLServer
    PayCtrl --> Interceptor --> SQLServer

    OrderCtrl -.->|HTTP Duration & Status| MW
    Interceptor -.->|SQL Query Execution Ms| MW
    MW --> AnomalyEngine --> RCAEngine --> Hub
    TrafficSim --> OrderCtrl
    ChaosManager --> Interceptor
```

---

## ⚡ E-Commerce Order Placement & Telemetry Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Shopper / SRE
    participant UI as ShopEasy Storefront
    participant AI as Aura AI Concierge
    participant OrderAPI as Orders API (/api/orders)
    participant Interceptor as EfQueryInterceptor
    participant DB as SQL Server (OrdersDb)
    participant Telemetry as TelemetryCollectorMiddleware
    participant RCA as IncidentIQ RCA Engine
    participant Monitor as Live Telemetry Stream

    Customer->>AI: "Find high-performance audio under ₹5000"
    AI->>UI: Return grounded catalog items + 1-Click "Add to Cart"
    Customer->>UI: Add to Cart, apply coupon "SAVE10", select UPI / Card
    Customer->>UI: Click "Place Monitored Order"
    
    UI->>OrderAPI: POST /api/orders (Items, Customer, Address)
    OrderAPI->>Interceptor: Execute DbCommand (Insert Order & OrderItems)
    Interceptor->>DB: Begin Transaction & Decrement Stock
    DB-->>Interceptor: Committed (e.g. 8ms normal / 1450ms under chaos lock)
    Interceptor-->>Telemetry: Report SQL Latency Duration
    OrderAPI-->>UI: 201 Created (OrderId, Total, TelemetryTraceId)
    
    OrderAPI-->>Telemetry: Report HTTP Status 201 & Request Duration
    Telemetry->>RCA: Correlate TraceId, Latency Drift & Error Baseline
    RCA->>Monitor: Stream Live Metric Sample & Trace Log
    UI-->>Customer: Display Order Confirmation Modal with Trace ID
```

---

## 🤖 Aura AI Conversational Shopping Flow

```mermaid
flowchart TD
    UserQuery["User Natural Language Query\n(e.g., 'Best coding keyboard and monitor setup under ₹50k')"]
    
    subgraph AuraEngine["Aura AI Decision Engine"]
        Parser["Intent & Entity Extraction\n• Budget: ₹50,000\n• Categories: Peripherals, Displays\n• Use-Case: Coding / Dev"]
        CatalogFilter["Strict Catalog Grounding & Constraint Filter\n• Filter verified items in stock\n• Validate prices and specs"]
        ComparisonLogic{"Is Comparison Requested?"}
        Ranker["Multi-Factor Ranking\n(Rating ★ × Review Count × Spec Fit)"]
    end
    
    subgraph UIOutput["Interactive Storefront Output"]
        ChatResponse["Conversational Explanation & Grounded Advice"]
        ProductCards["Interactive Recommendation Cards\n• Image, Badge, Rating & Price\n• Quick 'Add to Cart' Button\n• 'Quick View Specs' Button"]
        SideBySide["Side-by-Side Spec Comparison Grid"]
    end

    UserQuery --> Parser --> CatalogFilter --> ComparisonLogic
    ComparisonLogic -->|Yes| SideBySide --> ChatResponse
    ComparisonLogic -->|No| Ranker --> ProductCards --> ChatResponse
    ChatResponse --> CartDirect["Direct Cart Addition & Checkout Sync"]
```

---

## ✨ Features Breakdown

### 🛍️ ShopEasy E-Commerce Core
- **Curated 15-Product Tech Catalog:** High-resolution photography, categorized under *Audio, Peripherals, Displays, Wearables, Storage, Video, Accessories, Furniture, and Smart Home*.
- **Technical Specification Drilldown:** In-depth product modal with technical specs tables, warranty badges, verified reviews, and instant "Buy Now" flow.
- **Persistent Wishlist:** One-click favorite toggling saved to browser storage, with easy "Move to Cart" drawer actions.
- **Promo & Coupon Engine:** Instant discount calculation supporting `SAVE10` (10% off), `TECH20` (20% off > ₹10,000), and `FREESHIP`.
- **Flexible Checkout:** Multi-payment options including Credit/Debit Card, UPI / QR Code, Net Banking, and Cash on Delivery (COD) with itemized GST breakdown.
- **Order History & Telemetry Link:** Tracks previous orders with live status badges and direct links to inspect the associated transaction's SQL query and HTTP latency traces.

### 🧠 Aura AI Shopping Concierge
- **Strict Catalog Grounding:** Answers customer queries strictly from real catalog data without inventing non-existent models, fake stock, or hallucinated prices.
- **Natural Language & Budget Parsing:** Extracts price thresholds (e.g. *"under 5k"*, *"below ₹15,000"*), target categories, and use cases (*"gaming"*, *"podcasting"*, *"remote work"*).
- **Side-by-Side Comparison:** Compares specifications, ratings, and price-to-performance metrics between products.
- **1-Click Cart Addition:** Directly adds recommended product bundles into the shopping cart from within the chat interface.

### 📈 IncidentIQ SRE Observability Platform
- **Dual Telemetry Ingestion:** Supports push telemetry (`POST /api/monitoring/ingest`) and real-time middleware interception.
- **Chaos Laboratory:** Inject synthetic failure modes (Database Lock & Slowdown, HTTP 500 Payment Outage, Traffic Surge Threadpool Saturation, Cascading Failures).
- **Automated Root-Cause Diagnosis:** Correlates time-series anomaly sequences to diagnose root causes with percentage confidence scores and suggested remediation plans.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) & [npm](https://www.npmjs.com/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (optional for backend API execution)

### 1. Run Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Build Frontend for Production (Bundles into WebApi wwwroot)
```bash
cd frontend
npm run build
```

### 3. Run Backend .NET Web API
```powershell
dotnet run --project .\src\IncidentIQ.WebApi
```
The SQLite database (`incidentiq-platform.db`) is automatically initialized and seeded with the rich product catalog and monitoring endpoints.

### 4. Docker / SQL Server Deployment
```powershell
docker compose up --build
```
Access the application at `http://localhost:8080`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Query catalog items with `?category=`, `?search=`, `?sort=`, and `?minPrice=` |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `POST` | `/api/orders` | Place a new order, deduct stock, and emit telemetry |
| `GET` | `/api/orders` | Retrieve recent orders with full line item details |
| `POST` | `/api/payments` | Process virtual payment settlement for an order |
| `POST` | `/api/monitoring/ingest` | Ingest external application telemetry events |
| `GET` | `/api/simulation/state` | Inspect current chaos failure simulation status |
| `POST` | `/api/simulation/command` | Inject or reset chaos failure states |
