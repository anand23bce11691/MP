IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ApplicationLogs] (
    [LogId] bigint NOT NULL IDENTITY,
    [Timestamp] datetime2 NOT NULL,
    [RequestMethod] nvarchar(10) NOT NULL,
    [RequestPath] nvarchar(250) NOT NULL,
    [StatusCode] int NOT NULL,
    [ResponseTimeMs] float NOT NULL,
    [SqlTimeMs] float NOT NULL,
    [ErrorMessage] nvarchar(max) NULL,
    CONSTRAINT [PK_ApplicationLogs] PRIMARY KEY ([LogId])
);
GO

CREATE TABLE [Incidents] (
    [IncidentId] int NOT NULL IDENTITY,
    [IncidentNumber] nvarchar(20) NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [IncidentType] nvarchar(100) NOT NULL,
    [Severity] nvarchar(20) NOT NULL,
    [Status] nvarchar(30) NOT NULL,
    [DetectedAt] datetime2 NOT NULL,
    [ResolvedAt] datetime2 NULL,
    [ConfidencePercentage] float NOT NULL,
    [RootCauseSummary] nvarchar(max) NOT NULL,
    [RecommendedAction] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Incidents] PRIMARY KEY ([IncidentId])
);
GO

CREATE TABLE [Products] (
    [ProductId] int NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [StockQuantity] int NOT NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([ProductId])
);
GO

CREATE TABLE [SystemMetrics] (
    [MetricId] bigint NOT NULL IDENTITY,
    [Timestamp] datetime2 NOT NULL,
    [ApiLatencyMs] float NOT NULL,
    [SqlLatencyMs] float NOT NULL,
    [RequestsPerMin] int NOT NULL,
    [ErrorCountPerMin] int NOT NULL,
    [CpuUsagePercentage] float NOT NULL,
    [MemoryUsagePercentage] float NOT NULL,
    [ActiveDbConnections] int NOT NULL,
    CONSTRAINT [PK_SystemMetrics] PRIMARY KEY ([MetricId])
);
GO

CREATE TABLE [Users] (
    [UserId] int NOT NULL IDENTITY,
    [Username] nvarchar(100) NOT NULL,
    [Email] nvarchar(150) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId])
);
GO

CREATE TABLE [IncidentEvidences] (
    [EvidenceId] int NOT NULL IDENTITY,
    [IncidentId] int NOT NULL,
    [SequenceOrder] int NOT NULL,
    [Timestamp] datetime2 NOT NULL,
    [MetricName] nvarchar(100) NOT NULL,
    [ObservedValue] nvarchar(100) NOT NULL,
    [BaselineValue] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    CONSTRAINT [PK_IncidentEvidences] PRIMARY KEY ([EvidenceId]),
    CONSTRAINT [FK_IncidentEvidences_Incidents_IncidentId] FOREIGN KEY ([IncidentId]) REFERENCES [Incidents] ([IncidentId]) ON DELETE CASCADE
);
GO

CREATE TABLE [Orders] (
    [OrderId] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [TotalAmount] decimal(18,2) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([OrderId]),
    CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [OrderItems] (
    [OrderItemId] int NOT NULL IDENTITY,
    [OrderId] int NOT NULL,
    [ProductId] int NOT NULL,
    [Quantity] int NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_OrderItems] PRIMARY KEY ([OrderItemId]),
    CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([ProductId]) ON DELETE NO ACTION
);
GO

CREATE TABLE [Payments] (
    [PaymentId] int NOT NULL IDENTITY,
    [OrderId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PaymentMethod] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY ([PaymentId]),
    CONSTRAINT [FK_Payments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ApplicationLogs_Timestamp] ON [ApplicationLogs] ([Timestamp]);
GO

CREATE INDEX [IX_IncidentEvidences_IncidentId_SequenceOrder] ON [IncidentEvidences] ([IncidentId], [SequenceOrder]);
GO

CREATE UNIQUE INDEX [IX_Incidents_IncidentNumber] ON [Incidents] ([IncidentNumber]);
GO

CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
GO

CREATE INDEX [IX_OrderItems_ProductId] ON [OrderItems] ([ProductId]);
GO

CREATE INDEX [IX_Orders_UserId] ON [Orders] ([UserId]);
GO

CREATE UNIQUE INDEX [IX_Payments_OrderId] ON [Payments] ([OrderId]);
GO

CREATE INDEX [IX_SystemMetrics_Timestamp] ON [SystemMetrics] ([Timestamp]);
GO

CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260817092946_InitialSqlServerCreate', N'8.0.8');
GO

COMMIT;
GO

