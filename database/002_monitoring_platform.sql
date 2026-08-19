/* Apply after 001_initial_schema.sql when upgrading an existing SQL Server IncidentIQ database. */
SET XACT_ABORT ON;
BEGIN TRANSACTION;

CREATE TABLE dbo.MonitoredApplications (
    MonitoredApplicationId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MonitoredApplications PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    BaseUrl NVARCHAR(500) NOT NULL,
    ApiKey NVARCHAR(80) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_MonitoredApplications_IsActive DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_MonitoredApplications_CreatedAt DEFAULT SYSUTCDATETIME(),
    LastSeenAt DATETIME2 NULL,
    CONSTRAINT UQ_MonitoredApplications_ApiKey UNIQUE (ApiKey)
);

CREATE TABLE dbo.MonitoredEndpoints (
    MonitoredEndpointId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MonitoredEndpoints PRIMARY KEY,
    MonitoredApplicationId INT NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    Url NVARCHAR(500) NOT NULL,
    Method NVARCHAR(10) NOT NULL,
    ExpectedStatusCode INT NOT NULL CONSTRAINT DF_MonitoredEndpoints_ExpectedStatus DEFAULT 200,
    CheckIntervalSeconds INT NOT NULL CONSTRAINT DF_MonitoredEndpoints_Interval DEFAULT 30,
    IsActive BIT NOT NULL CONSTRAINT DF_MonitoredEndpoints_IsActive DEFAULT 1,
    LastCheckedAt DATETIME2 NULL,
    CONSTRAINT FK_MonitoredEndpoints_Applications FOREIGN KEY (MonitoredApplicationId) REFERENCES dbo.MonitoredApplications(MonitoredApplicationId) ON DELETE CASCADE
);
CREATE INDEX IX_MonitoredEndpoints_ApplicationId ON dbo.MonitoredEndpoints(MonitoredApplicationId);

CREATE TABLE dbo.TelemetryEvents (
    TelemetryEventId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TelemetryEvents PRIMARY KEY,
    MonitoredApplicationId INT NOT NULL,
    EventType NVARCHAR(50) NOT NULL,
    Source NVARCHAR(50) NOT NULL,
    Endpoint NVARCHAR(500) NULL,
    StatusCode INT NULL,
    DurationMs FLOAT NULL,
    Severity NVARCHAR(20) NOT NULL CONSTRAINT DF_TelemetryEvents_Severity DEFAULT 'Info',
    Message NVARCHAR(2000) NULL,
    [Timestamp] DATETIME2 NOT NULL CONSTRAINT DF_TelemetryEvents_Timestamp DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_TelemetryEvents_Applications FOREIGN KEY (MonitoredApplicationId) REFERENCES dbo.MonitoredApplications(MonitoredApplicationId) ON DELETE CASCADE
);
CREATE INDEX IX_TelemetryEvents_ApplicationId_Timestamp ON dbo.TelemetryEvents(MonitoredApplicationId, [Timestamp]);

ALTER TABLE dbo.Incidents ADD MonitoredApplicationId INT NULL;
ALTER TABLE dbo.Incidents ADD CONSTRAINT FK_Incidents_MonitoredApplications FOREIGN KEY (MonitoredApplicationId) REFERENCES dbo.MonitoredApplications(MonitoredApplicationId) ON DELETE SET NULL;
CREATE INDEX IX_Incidents_MonitoredApplicationId ON dbo.Incidents(MonitoredApplicationId);
COMMIT TRANSACTION;
