using IncidentIQ.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<SystemMetric> SystemMetrics => Set<SystemMetric>();
    public DbSet<ApplicationLog> ApplicationLogs => Set<ApplicationLog>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<IncidentEvidence> IncidentEvidences => Set<IncidentEvidence>();
    public DbSet<MonitoredApplication> MonitoredApplications => Set<MonitoredApplication>();
    public DbSet<MonitoredEndpoint> MonitoredEndpoints => Set<MonitoredEndpoint>();
    public DbSet<TelemetryEvent> TelemetryEvents => Set<TelemetryEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Business Configurations
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.HasIndex(e => e.Category);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId);
            entity.HasIndex(e => e.OrderId);
            entity.HasIndex(e => e.ProductId);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.HasOne(e => e.Order)
                  .WithMany(o => o.OrderItems)
                  .HasForeignKey(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Product)
                  .WithMany(p => p.OrderItems)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId);
            // 1:1 Enforced via Unique Index on OrderId
            entity.HasIndex(e => e.OrderId).IsUnique();
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.HasOne(e => e.Order)
                  .WithOne(o => o.Payment)
                  .HasForeignKey<Payment>(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Telemetry Indexes
        modelBuilder.Entity<SystemMetric>(entity =>
        {
            entity.HasKey(e => e.MetricId);
            entity.HasIndex(e => e.Timestamp);
            entity.Property(e => e.ApiLatencyMs).IsRequired();
            entity.Property(e => e.SqlLatencyMs).IsRequired();
        });

        modelBuilder.Entity<ApplicationLog>(entity =>
        {
            entity.HasKey(e => e.LogId);
            entity.HasIndex(e => e.Timestamp);
            entity.Property(e => e.RequestMethod).HasMaxLength(10).IsRequired();
            entity.Property(e => e.RequestPath).HasMaxLength(250).IsRequired();
        });

        // Incident Indexes & Relationships
        modelBuilder.Entity<Incident>(entity =>
        {
            entity.HasKey(e => e.IncidentId);
            entity.HasIndex(e => e.IncidentNumber).IsUnique();
            entity.Property(e => e.IncidentNumber).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.IncidentType).HasConversion<string>().HasMaxLength(100).IsRequired();
            entity.Property(e => e.Severity).HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            entity.Property(e => e.RootCauseSummary).IsRequired();
            entity.Property(e => e.RecommendedAction).IsRequired();
            entity.HasOne(e => e.MonitoredApplication)
                  .WithMany(a => a.Incidents)
                  .HasForeignKey(e => e.MonitoredApplicationId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IncidentEvidence>(entity =>
        {
            entity.HasKey(e => e.EvidenceId);
            entity.HasIndex(e => new { e.IncidentId, e.SequenceOrder });
            entity.Property(e => e.MetricName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ObservedValue).HasMaxLength(100).IsRequired();
            entity.Property(e => e.BaselineValue).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500).IsRequired();
            entity.HasOne(e => e.Incident)
                  .WithMany(i => i.Evidences)
                  .HasForeignKey(e => e.IncidentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MonitoredApplication>(entity =>
        {
            entity.HasKey(e => e.MonitoredApplicationId);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.BaseUrl).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ApiKey).HasMaxLength(80).IsRequired();
            entity.HasIndex(e => e.ApiKey).IsUnique();
        });

        modelBuilder.Entity<MonitoredEndpoint>(entity =>
        {
            entity.HasKey(e => e.MonitoredEndpointId);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Url).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Method).HasMaxLength(10).IsRequired();
            entity.HasOne(e => e.MonitoredApplication)
                  .WithMany(a => a.Endpoints)
                  .HasForeignKey(e => e.MonitoredApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TelemetryEvent>(entity =>
        {
            entity.HasKey(e => e.TelemetryEventId);
            entity.Property(e => e.EventType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Source).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Endpoint).HasMaxLength(500);
            entity.Property(e => e.Severity).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Message).HasMaxLength(2000);
            entity.HasIndex(e => new { e.MonitoredApplicationId, e.Timestamp });
            entity.HasOne(e => e.MonitoredApplication)
                  .WithMany(a => a.TelemetryEvents)
                  .HasForeignKey(e => e.MonitoredApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
