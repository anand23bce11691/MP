using IncidentIQ.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.Infrastructure.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        try
        {
            context.Database.EnsureCreated();

            // Auto-migrate schema updates for SQL Server if columns were added
            context.Database.ExecuteSqlRaw(@"
                IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Incidents')
                BEGIN
                    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Incidents' AND COLUMN_NAME = 'MonitoredApplicationId')
                    BEGIN
                        ALTER TABLE [Incidents] ADD [MonitoredApplicationId] INT NULL;
                    END
                END
            ");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB Migration Note] {ex.Message}");
        }

        // 1. Seed Products if empty
        if (!context.Products.Any())
        {
            var categories = new[] { "Electronics", "Clothing", "Home", "Books", "Sports" };
            var products = new List<Product>();

            for (int i = 1; i <= 50; i++)
            {
                var category = categories[(i - 1) % categories.Length];
                products.Add(new Product
                {
                    Name = $"{category} Item #{i}",
                    Price = Math.Round((decimal)(15.0 + (i * 3.5)), 2),
                    StockQuantity = 100 + (i * 10)
                });
            }
            context.Products.AddRange(products);
        }

        // 2. Seed Users if empty
        if (!context.Users.Any())
        {
            var users = new List<User>();
            for (int i = 1; i <= 10; i++)
            {
                users.Add(new User
                {
                    Username = $"customer_{i}",
                    Email = $"user{i}@shopeasy.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-i)
                });
            }
            context.Users.AddRange(users);
        }

        // 3. Seed Monitored Applications if empty
        if (!context.MonitoredApplications.Any())
        {
            var shopEasyApp = new MonitoredApplication
            {
                Name = "ShopEasy E-Commerce Core",
                BaseUrl = "http://localhost:5000",
                ApiKey = "app_shopeasy_live_key_99",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            };

            var paymentGwApp = new MonitoredApplication
            {
                Name = "Payment Gateway Microservice",
                BaseUrl = "http://localhost:5001",
                ApiKey = "app_payment_gw_key_88",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            };

            var inventoryApp = new MonitoredApplication
            {
                Name = "Inventory & Fulfillment Service",
                BaseUrl = "http://localhost:5002",
                ApiKey = "app_inventory_key_77",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            };

            context.MonitoredApplications.AddRange(shopEasyApp, paymentGwApp, inventoryApp);
            context.SaveChanges();

            // Seed Endpoints for ShopEasy App
            context.MonitoredEndpoints.AddRange(
                new MonitoredEndpoint
                {
                    MonitoredApplicationId = shopEasyApp.MonitoredApplicationId,
                    Name = "Order Placement API",
                    Url = "http://localhost:5000/api/orders",
                    Method = "POST",
                    ExpectedStatusCode = 201,
                    CheckIntervalSeconds = 10,
                    IsActive = true,
                    LastCheckedAt = DateTime.UtcNow
                },
                new MonitoredEndpoint
                {
                    MonitoredApplicationId = shopEasyApp.MonitoredApplicationId,
                    Name = "Payment Processing API",
                    Url = "http://localhost:5000/api/payments",
                    Method = "POST",
                    ExpectedStatusCode = 200,
                    CheckIntervalSeconds = 10,
                    IsActive = true,
                    LastCheckedAt = DateTime.UtcNow
                },
                new MonitoredEndpoint
                {
                    MonitoredApplicationId = shopEasyApp.MonitoredApplicationId,
                    Name = "Product Catalog API",
                    Url = "http://localhost:5000/api/products",
                    Method = "GET",
                    ExpectedStatusCode = 200,
                    CheckIntervalSeconds = 15,
                    IsActive = true,
                    LastCheckedAt = DateTime.UtcNow
                }
            );
        }

        context.SaveChanges();
    }
}
