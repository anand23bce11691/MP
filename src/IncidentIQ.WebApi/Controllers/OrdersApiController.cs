using IncidentIQ.Application.Dtos;
using IncidentIQ.Domain.Entities;
using IncidentIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersApiController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrdersApiController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto request)
    {
        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(new { Message = "Order must contain at least one item." });
        }

        var strategy = _db.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            var user = await _db.Users.FindAsync(request.UserId);
            if (user == null)
            {
                user = await _db.Users.FirstOrDefaultAsync();
                if (user == null)
                {
                    user = new User { Username = "guest_user", Email = "guest@shopeasy.com" };
                    _db.Users.Add(user);
                    await _db.SaveChangesAsync();
                }
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var order = new Order
                {
                    UserId = user.UserId,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                decimal total = 0;
                var itemResponses = new List<OrderItemResponseDto>();

                foreach (var itemReq in request.Items)
                {
                    var product = await _db.Products.FindAsync(itemReq.ProductId);
                    if (product == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { Message = $"Product #{itemReq.ProductId} not found." }) as IActionResult;
                    }

                    if (product.StockQuantity < itemReq.Quantity)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { Message = $"Insufficient stock for product '{product.Name}'. Requested: {itemReq.Quantity}, Available: {product.StockQuantity}" }) as IActionResult;
                    }

                    // Real stock deduction
                    product.StockQuantity -= itemReq.Quantity;

                    var lineTotal = product.Price * itemReq.Quantity;
                    total += lineTotal;

                    order.OrderItems.Add(new OrderItem
                    {
                        ProductId = product.ProductId,
                        Quantity = itemReq.Quantity,
                        UnitPrice = product.Price
                    });

                    itemResponses.Add(new OrderItemResponseDto(product.ProductId, product.Name, itemReq.Quantity, product.Price));
                }

                order.TotalAmount = total;
                _db.Orders.Add(order);

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId },
                    new OrderResponseDto(order.OrderId, order.UserId, order.TotalAmount, order.Status, order.CreatedAt, itemResponses)) as IActionResult;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "Failed to process order transaction", Error = ex.Message }) as IActionResult;
            }
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] int limit = 20)
    {
        var orders = await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .Include(o => o.Payment)
            .OrderByDescending(o => o.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        var dtos = orders.Select(o => new OrderResponseDto(
            o.OrderId,
            o.UserId,
            o.TotalAmount,
            o.Status,
            o.CreatedAt,
            o.OrderItems.Select(i => new OrderItemResponseDto(i.ProductId, i.Product?.Name ?? $"Product #{i.ProductId}", i.Quantity, i.UnitPrice)).ToList()
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .Include(o => o.Payment)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null) return NotFound(new { Message = $"Order #{id} not found." });

        var items = order.OrderItems.Select(i => new OrderItemResponseDto(i.ProductId, i.Product?.Name ?? $"Product #{i.ProductId}", i.Quantity, i.UnitPrice)).ToList();
        return Ok(new OrderResponseDto(order.OrderId, order.UserId, order.TotalAmount, order.Status, order.CreatedAt, items));
    }
}
