/* IncidentIQ initial SQL Server schema. Run against an empty IncidentIQ database. */
SET XACT_ABORT ON;
BEGIN TRANSACTION;

CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Users_Email UNIQUE (Email)
);

CREATE TABLE dbo.Products (
    ProductId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    StockQuantity INT NOT NULL,
    CONSTRAINT CK_Products_Price CHECK (Price >= 0),
    CONSTRAINT CK_Products_Stock CHECK (StockQuantity >= 0)
);

CREATE TABLE dbo.Orders (
    OrderId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Orders PRIMARY KEY,
    UserId INT NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT CK_Orders_TotalAmount CHECK (TotalAmount >= 0)
);
CREATE INDEX IX_Orders_UserId ON dbo.Orders(UserId);

CREATE TABLE dbo.OrderItems (
    OrderItemId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrderItems PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
    CONSTRAINT CK_OrderItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_OrderItems_UnitPrice CHECK (UnitPrice >= 0)
);
CREATE INDEX IX_OrderItems_OrderId ON dbo.OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON dbo.OrderItems(ProductId);

CREATE TABLE dbo.Payments (
    PaymentId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Payments PRIMARY KEY,
    OrderId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Payments_OrderId UNIQUE (OrderId),
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(OrderId) ON DELETE CASCADE,
    CONSTRAINT CK_Payments_Amount CHECK (Amount >= 0)
);

CREATE TABLE dbo.SystemMetrics (
    MetricId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SystemMetrics PRIMARY KEY,
    [Timestamp] DATETIME2 NOT NULL CONSTRAINT DF_SystemMetrics_Timestamp DEFAULT SYSUTCDATETIME(),
    ApiLatencyMs FLOAT NOT NULL,
    SqlLatencyMs FLOAT NOT NULL,
    RequestsPerMin INT NOT NULL,
    ErrorCountPerMin INT NOT NULL,
    CpuUsagePercentage FLOAT NOT NULL,
    MemoryUsagePercentage FLOAT NOT NULL,
    ActiveDbConnections INT NOT NULL
);
CREATE INDEX IX_SystemMetrics_Timestamp ON dbo.SystemMetrics([Timestamp]);

CREATE TABLE dbo.ApplicationLogs (
    LogId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ApplicationLogs PRIMARY KEY,
    [Timestamp] DATETIME2 NOT NULL CONSTRAINT DF_ApplicationLogs_Timestamp DEFAULT SYSUTCDATETIME(),
    RequestMethod NVARCHAR(10) NOT NULL,
    RequestPath NVARCHAR(250) NOT NULL,
    StatusCode INT NOT NULL,
    ResponseTimeMs FLOAT NOT NULL,
    SqlTimeMs FLOAT NOT NULL,
    ErrorMessage NVARCHAR(MAX) NULL
);
CREATE INDEX IX_ApplicationLogs_Timestamp ON dbo.ApplicationLogs([Timestamp]);

CREATE TABLE dbo.Incidents (
    IncidentId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Incidents PRIMARY KEY,
    IncidentNumber NVARCHAR(20) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    IncidentType NVARCHAR(100) NOT NULL,
    Severity NVARCHAR(20) NOT NULL,
    Status NVARCHAR(30) NOT NULL,
    DetectedAt DATETIME2 NOT NULL,
    ResolvedAt DATETIME2 NULL,
    ConfidencePercentage FLOAT NOT NULL,
    RootCauseSummary NVARCHAR(MAX) NOT NULL,
    RecommendedAction NVARCHAR(MAX) NOT NULL,
    CONSTRAINT UQ_Incidents_IncidentNumber UNIQUE (IncidentNumber),
    CONSTRAINT CK_Incidents_Confidence CHECK (ConfidencePercentage BETWEEN 0 AND 100)
);

CREATE TABLE dbo.IncidentEvidence (
    EvidenceId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_IncidentEvidence PRIMARY KEY,
    IncidentId INT NOT NULL,
    SequenceOrder INT NOT NULL,
    [Timestamp] DATETIME2 NOT NULL,
    MetricName NVARCHAR(100) NOT NULL,
    ObservedValue NVARCHAR(100) NOT NULL,
    BaselineValue NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    CONSTRAINT FK_IncidentEvidence_Incidents FOREIGN KEY (IncidentId) REFERENCES dbo.Incidents(IncidentId) ON DELETE CASCADE,
    CONSTRAINT UQ_IncidentEvidence_Sequence UNIQUE (IncidentId, SequenceOrder)
);
CREATE INDEX IX_IncidentEvidence_IncidentId_SequenceOrder ON dbo.IncidentEvidence(IncidentId, SequenceOrder);

COMMIT TRANSACTION;
