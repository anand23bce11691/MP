namespace IncidentIQ.Application.Dtos;

public record CreateOrderDto(int UserId, List<OrderItemRequestDto> Items);

public record OrderItemRequestDto(int ProductId, int Quantity);

public record OrderResponseDto(int OrderId, int UserId, decimal TotalAmount, string Status, DateTime CreatedAt, List<OrderItemResponseDto> Items);

public record OrderItemResponseDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice);

public record ProcessPaymentDto(int OrderId, decimal Amount, string PaymentMethod = "CreditCard");

public record PaymentResponseDto(int PaymentId, int OrderId, decimal Amount, string Status, DateTime CreatedAt);
