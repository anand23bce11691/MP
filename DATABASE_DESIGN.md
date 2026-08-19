# IncidentIQ - Enterprise Database Design Specification (SQL Server)

## 1. Executive Summary & ERD Architecture

The **IncidentIQ** database is built on **Microsoft SQL Server 2022**. It enforces strict domain isolation between the core e-commerce transactional database (**ShopEasy**) and the high-throughput time-series telemetry engine (**IncidentIQ Telemetry & RCA**).

```
 +-----------------------------------------------------------------------------------+
 |                              RELATIONAL SCHEMA DIAGRAM                            |
 +-----------------------------------------------------------------------------------+
 |                                                                                   |
 |  [Users] ----------< [Orders] >---------- [Payments] (1:1 Unique Index on OrderId)|
 |                         |                                                         |
 |                         v                                                         |
 |                 [OrderItems] >---------- [Products] (Optimistic Concurrency Check)|
 |                                                                                   |
 |  [SystemMetrics]       [ApplicationLogs]      [Incidents] ------< [IncidentEvidence]
 |  (Partitioned Range)   (Partitioned Range)   (Unique Ticket)     (FK Sequence Index) 
 +-----------------------------------------------------------------------------------+
```

---

## 2. Table Specifications & Data Dictionary

### 2.1 Business Commerce Domain Tables

#### 1. `Users`
- `UserId` (`INT`, `PK`, `IDENTITY(1,1)`): Primary key.
- `Username` (`NVARCHAR(100)`, `NOT NULL`): Account username.
- `Email` (`NVARCHAR(150)`, `NOT NULL`, `UNIQUE INDEX`): User email address.
- `PasswordHash` (`NVARCHAR(256)`, `NOT NULL`): PBKDF2 / Argon2 secure password hash.
- `Role` (`NVARCHAR(30)`, `NOT NULL`, `DEFAULT 'Customer'`): Security role (`Admin`, `Customer`).
- `IsDeleted` (`BIT`, `NOT NULL`, `DEFAULT 0`): Soft delete flag.
- `CreatedAt` (`DATETIME2`, `NOT NULL`, `DEFAULT GETUTCDATE()`): UTC timestamp.

#### 2. `Products`
- `ProductId` (`INT`, `PK`, `IDENTITY(1,1)`): Product SKU identifier.
- `Name` (`NVARCHAR(200)`, `NOT NULL`): Product title.
- `Price` (`DECIMAL(18,2)`, `NOT NULL`, `CHECK (Price > 0)`): Unit cost.
- `StockQuantity` (`INT`, `NOT NULL`, `CHECK (StockQuantity >= 0)`): Available inventory.
- `RowVersion` (`ROWVERSION` / `TIMESTAMP`, `NOT NULL`): Optimistic concurrency token to prevent race conditions during concurrent orders.

#### 3. `Orders`
- `OrderId` (`INT`, `PK`, `IDENTITY(1,1)`): Order transaction identifier.
- `UserId` (`INT`, `FK` $\rightarrow$ `Users.UserId`, `NOT NULL`): Customer reference.
- `TotalAmount` (`DECIMAL(18,2)`, `NOT NULL`, `CHECK (TotalAmount >= 0)`): Total cost.
- `Status` (`NVARCHAR(50)`, `NOT NULL`): Status (`Pending`, `Paid`, `Failed`, `Cancelled`).
- `CreatedAt` (`DATETIME2`, `NOT NULL`, `DEFAULT GETUTCDATE()`): Creation timestamp.

#### 4. `OrderItems`
- `OrderItemId` (`INT`, `PK`, `IDENTITY(1,1)`): Line item identifier.
- `OrderId` (`INT`, `FK` $\rightarrow$ `Orders.OrderId`, `ON DELETE CASCADE`): Parent order.
- `ProductId` (`INT`, `FK` $\rightarrow$ `Products.ProductId`, `RESTRICT`): Product item.
- `Quantity` (`INT`, `NOT NULL`, `CHECK (Quantity > 0)`): Purchased item count.
- `UnitPrice` (`DECIMAL(18,2)`, `NOT NULL`, `CHECK (UnitPrice >= 0)`): Price per unit.

#### 5. `Payments`
- `PaymentId` (`INT`, `PK`, `IDENTITY(1,1)`): Payment record identifier.
- `OrderId` (`INT`, `FK` $\rightarrow$ `Orders.OrderId`, `UNIQUE INDEX`, `ON DELETE CASCADE`): Order reference (enforces 1:1 relationship).
- `Amount` (`DECIMAL(18,2)`, `NOT NULL`, `CHECK (Amount >= 0)`): Amount processed.
- `PaymentMethod` (`NVARCHAR(50)`, `NOT NULL`): Payment provider (`CreditCard`, `PayPal`).
- `Status` (`NVARCHAR(50)`, `NOT NULL`): Status (`Success`, `Failed`, `TimedOut`).
- `TransactionReference` (`NVARCHAR(100)`, `NULL`): External gateway transaction ID.
- `CreatedAt` (`DATETIME2`, `NOT NULL`): Timestamp.

---

### 2.2 Telemetry & Time-Series Stream Tables

#### 6. `SystemMetrics` (Partitioned by Month)
- `MetricId` (`BIGINT`, `PK`, `IDENTITY(1,1)`): Identifier.
- `Timestamp` (`DATETIME2`, `NOT NULL`, `INDEXED`): Snapshot UTC timestamp.
- `ApiLatencyMs` (`FLOAT`, `NOT NULL`): Average API HTTP response latency (ms).
- `SqlLatencyMs` (`FLOAT`, `NOT NULL`): Average SQL query execution duration (ms).
- `RequestsPerMin` (`INT`, `NOT NULL`): Traffic throughput rate.
- `ErrorCountPerMin` (`INT`, `NOT NULL`): HTTP 5xx error frequency.
- `CpuUsagePercentage` (`FLOAT`, `NOT NULL`, `CHECK (CpuUsagePercentage BETWEEN 0 AND 100)`): Host CPU utilization %.
- `MemoryUsagePercentage` (`FLOAT`, `NOT NULL`, `CHECK (MemoryUsagePercentage BETWEEN 0 AND 100)`): Host memory consumption %.
- `ActiveDbConnections` (`INT`, `NOT NULL`): Connection pool count.

#### 7. `ApplicationLogs` (Partitioned by Month)
- `LogId` (`BIGINT`, `PK`, `IDENTITY(1,1)`): Log identifier.
- `Timestamp` (`DATETIME2`, `NOT NULL`, `INDEXED`): Event timestamp.
- `RequestMethod` (`NVARCHAR(10)`, `NOT NULL`): HTTP Verb (`GET`, `POST`, `PUT`, `DELETE`).
- `RequestPath` (`NVARCHAR(250)`, `NOT NULL`): Endpoint URI.
- `StatusCode` (`INT`, `NOT NULL`): HTTP status code.
- `ResponseTimeMs` (`FLOAT`, `NOT NULL`): Response latency (ms).
- `SqlTimeMs` (`FLOAT`, `NOT NULL`): SQL execution duration (ms).
- `TraceId` (`NVARCHAR(64)`, `NULL`): W3C Distributed Trace ID for OpenTelemetry correlation.
- `ErrorMessage` (`NVARCHAR(MAX)`, `NULL`): Exception message & stack trace.

---

### 2.3 AI Forensic RCA Tables

#### 8. `Incidents`
- `IncidentId` (`INT`, `PK`, `IDENTITY(1,1)`): Incident identifier.
- `IncidentNumber` (`NVARCHAR(30)`, `NOT NULL`, `UNIQUE INDEX`): Incident ticket code (e.g. `#1024`).
- `Title` (`NVARCHAR(200)`, `NOT NULL`): Short incident description.
- `IncidentType` (`NVARCHAR(100)`, `NOT NULL`): Classification (`DatabaseSlowdown`, `TrafficSpike`, `ApiFailure`, `CascadingFailure`).
- `Severity` (`NVARCHAR(20)`, `NOT NULL`): Severity level (`Low`, `Medium`, `High`, `Critical`).
- `Status` (`NVARCHAR(30)`, `NOT NULL`): Status (`Active`, `Investigating`, `Resolved`).
- `DetectedAt` (`DATETIME2`, `NOT NULL`): Detection UTC timestamp.
- `ResolvedAt` (`DATETIME2`, `NULL`): Resolution UTC timestamp.
- `ConfidencePercentage` (`FLOAT`, `NOT NULL`, `CHECK (ConfidencePercentage BETWEEN 0 AND 100)`): AI RCA confidence rating.
- `RootCauseSummary` (`NVARCHAR(MAX)`, `NOT NULL`): Temporal root-cause diagnostic explanation.
- `RecommendedAction` (`NVARCHAR(MAX)`, `NOT NULL`): Prescriptive remediation advice.

#### 9. `IncidentEvidence`
- `EvidenceId` (`INT`, `PK`, `IDENTITY(1,1)`): Evidence record identifier.
- `IncidentId` (`INT`, `FK` $\rightarrow$ `Incidents.IncidentId`, `ON DELETE CASCADE`): Parent incident.
- `SequenceOrder` (`INT`, `NOT NULL`): Chronological order rank (1, 2, 3...).
- `Timestamp` (`DATETIME2`, `NOT NULL`): Observation timestamp.
- `MetricName` (`NVARCHAR(100)`, `NOT NULL`): Metric analyzed.
- `ObservedValue` (`NVARCHAR(100)`, `NOT NULL`): Measured value.
- `BaselineValue` (`NVARCHAR(100)`, `NOT NULL`): Baseline value.
- `Description` (`NVARCHAR(500)`, `NOT NULL`): Forensic breakdown detail.

---

## 3. High-Performance Indexing & Partitioning Strategy

### 3.1 Non-Clustered Indexes

| Index Name | Target Table | Columns | Purpose |
| :--- | :--- | :--- | :--- |
| `IX_SystemMetrics_Timestamp` | `SystemMetrics` | `(Timestamp DESC)` | Accelerates 5s and 30s rolling window metric aggregations. |
| `IX_ApplicationLogs_Timestamp_Status` | `ApplicationLogs` | `(Timestamp DESC, StatusCode)` | Accelerates error-rate filtering and time-series trace correlation. |
| `IX_Users_Email` | `Users` | `(Email)` UNIQUE | Enforces unique user login credentials. |
| `IX_Orders_UserId_CreatedAt` | `Orders` | `(UserId, CreatedAt DESC)` | Speeds up customer order history queries. |
| `IX_OrderItems_OrderId_ProductId` | `OrderItems` | `(OrderId, ProductId)` | Fast line-item lookup during checkout and stock auditing. |
| `IX_Payments_OrderId` | `Payments` | `(OrderId)` UNIQUE | Enforces strict 1:1 Order-Payment business rule. |
| `IX_Incidents_Number` | `Incidents` | `(IncidentNumber)` UNIQUE | Rapid ticket retrieval. |
| `IX_Evidence_IncidentId_Seq` | `IncidentEvidence` | `(IncidentId, SequenceOrder)` | Retains strict timeline order during evidence chain retrieval. |

### 3.2 Partitioning & Purging Strategy
- **Partitioning Scheme**: `SystemMetrics` and `ApplicationLogs` are partitioned using `RANGE RIGHT BY (Timestamp)` by month.
- **Purging Retention Policy**: A background SQL Agent job (`sp_purge_old_telemetry`) automatically truncates raw `ApplicationLogs` partitions older than 30 days while retaining aggregated `SystemMetrics` for 90 days.

---

## 4. T-SQL Data Integrity Constraints Summary

```sql
-- Price & Quantity Positive Checks
ALTER TABLE Products ADD CONSTRAINT CK_Products_Price CHECK (Price > 0);
ALTER TABLE Products ADD CONSTRAINT CK_Products_Stock CHECK (StockQuantity >= 0);
ALTER TABLE OrderItems ADD CONSTRAINT CK_OrderItems_Quantity CHECK (Quantity > 0);

-- Telemetry Percentage Range Checks
ALTER TABLE SystemMetrics ADD CONSTRAINT CK_Metrics_Cpu CHECK (CpuUsagePercentage BETWEEN 0 AND 100);
ALTER TABLE SystemMetrics ADD CONSTRAINT CK_Metrics_Memory CHECK (MemoryUsagePercentage BETWEEN 0 AND 100);
ALTER TABLE Incidents ADD CONSTRAINT CK_Incidents_Confidence CHECK (ConfidencePercentage BETWEEN 0 AND 100);
```
