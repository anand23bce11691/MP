using IncidentIQ.Application.Dtos;
using IncidentIQ.Domain.Entities;
using IncidentIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsApiController : ControllerBase
{
    private readonly AppDbContext _db;

    public PaymentsApiController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDto request)
    {
        var order = await _db.Orders.Include(o => o.Payment).FirstOrDefaultAsync(o => o.OrderId == request.OrderId);
        if (order == null)
        {
            return NotFound(new { Message = "Order not found" });
        }

        if (order.Payment != null)
        {
            return Ok(new PaymentResponseDto(order.Payment.PaymentId, order.Payment.OrderId, order.Payment.Amount, order.Payment.Status, order.Payment.CreatedAt));
        }

        var payment = new Payment
        {
            OrderId = order.OrderId,
            Amount = request.Amount > 0 ? request.Amount : order.TotalAmount,
            PaymentMethod = request.PaymentMethod,
            Status = "Success",
            CreatedAt = DateTime.UtcNow
        };

        order.Status = "Paid";
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        return Ok(new PaymentResponseDto(payment.PaymentId, payment.OrderId, payment.Amount, payment.Status, payment.CreatedAt));
    }
}
