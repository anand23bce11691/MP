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
            var products = new List<Product>
            {
                new() { Name = "Pro Wireless ANC Headphones", Category = "Audio", Price = 14999m, Rating = 4.8, ReviewsCount = 124, ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", Description = "Active noise cancelling wireless headphones with crystal-clear spatial audio & 40-hour battery life.", StockQuantity = 35 },
                new() { Name = "Ergonomic Mechanical Keyboard", Category = "Peripherals", Price = 8499m, Rating = 4.9, ReviewsCount = 98, ImageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80", Description = "Hot-swappable RGB mechanical coding and gaming keyboard with smooth tactile switches.", StockQuantity = 20 },
                new() { Name = "UltraWide 34\" Curved Monitor", Category = "Displays", Price = 42999m, Rating = 4.7, ReviewsCount = 64, ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80", Description = "144Hz WQHD IPS display designed for maximum multi-tasking productivity and crisp visual clarity.", StockQuantity = 12 },
                new() { Name = "Precision Wireless Gaming Mouse", Category = "Peripherals", Price = 4499m, Rating = 4.6, ReviewsCount = 152, ImageUrl = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80", Description = "Ultra-lightweight 26K DPI optical sensor with ergonomic thumb rest and wireless charging dock.", StockQuantity = 48 },
                new() { Name = "Smart Fitness & Health Watch", Category = "Wearables", Price = 6999m, Rating = 4.5, ReviewsCount = 88, ImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", Description = "Continuous heart rate tracking, GPS route mapping, sleep analytics, and 7-day battery.", StockQuantity = 25 },
                new() { Name = "High-Speed 2TB NVMe Portable SSD", Category = "Storage", Price = 12499m, Rating = 4.9, ReviewsCount = 210, ImageUrl = "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80", Description = "Shock-resistant USB 3.2 Gen2x2 portable drive with lightning-fast 2000MB/s data transfers.", StockQuantity = 50 },
                new() { Name = "4K Ultra HD Web Cam with Ring Light", Category = "Video", Price = 7999m, Rating = 4.6, ReviewsCount = 42, ImageUrl = "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&q=80", Description = "Auto-focus streaming webcam with integrated soft ring light, privacy shutter, and noise-canceling dual mics.", StockQuantity = 18 },
                new() { Name = "Aluminum 11-in-1 USB-C Docking Hub", Category = "Accessories", Price = 4999m, Rating = 4.4, ReviewsCount = 76, ImageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80", Description = "Dual 4K HDMI ports, Gigabit Ethernet, 100W PD Pass-through charging, and high-speed SD card readers.", StockQuantity = 30 },
                new() { Name = "Ergonomic Mesh Executive Chair", Category = "Furniture", Price = 18999m, Rating = 4.8, ReviewsCount = 59, ImageUrl = "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&q=80", Description = "Adjustable dynamic lumbar support, 3D armrests, and breathable high-density mesh backrest.", StockQuantity = 8 },
                new() { Name = "Portable Bluetooth Waterproof Speaker", Category = "Audio", Price = 3499m, Rating = 4.7, ReviewsCount = 140, ImageUrl = "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80", Description = "Deep bass 360-degree room-filling audio with IP67 dust and water resistance for outdoor use.", StockQuantity = 42 },
                new() { Name = "Smart Home AI Voice Assistant Hub", Category = "Smart Home", Price = 5999m, Rating = 4.3, ReviewsCount = 37, ImageUrl = "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&q=80", Description = "7-inch HD touchscreen smart hub controlling lighting, security cameras, and multi-room audio.", StockQuantity = 22 },
                new() { Name = "MagSafe Wireless 3-in-1 Charging Stand", Category = "Accessories", Price = 3299m, Rating = 4.8, ReviewsCount = 115, ImageUrl = "https://images.unsplash.com/photo-1622445268465-8438364058d7?w=500&q=80", Description = "Fast 15W wireless charging stand for your smartphone, smartwatch, and wireless earbuds simultaneously.", StockQuantity = 60 },
                new() { Name = "Studio Condenser USB Microphone", Category = "Audio", Price = 8999m, Rating = 4.9, ReviewsCount = 83, ImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80", Description = "Broadcast-quality cardioid pickup pattern with anti-vibration shock mount and physical gain control knob.", StockQuantity = 15 },
                new() { Name = "Extended Micro-Weave Desk Mat Pad", Category = "Accessories", Price = 1499m, Rating = 4.7, ReviewsCount = 192, ImageUrl = "https://images.unsplash.com/photo-1616440342855-5463690d797c?w=500&q=80", Description = "Water-repellent anti-fray stitched edge desk mat pad (900x400mm) for ultra-smooth tracking.", StockQuantity = 100 },
                new() { Name = "20,000mAh 65W Fast Power Bank", Category = "Accessories", Price = 3999m, Rating = 4.6, ReviewsCount = 94, ImageUrl = "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=500&q=80", Description = "Charge laptops and mobile phones simultaneously with real-time digital battery status display.", StockQuantity = 45 }
            };
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
