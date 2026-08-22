using IncidentIQ.Domain.Entities;
using IncidentIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsApiController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsApiController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int limit = 50)
    {
        var query = _db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category) && !category.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(p => p.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower) || p.Description.ToLower().Contains(searchLower));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        query = sort?.ToLowerInvariant() switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "rating_desc" => query.OrderByDescending(p => p.Rating),
            "name_asc" => query.OrderBy(p => p.Name),
            _ => query.OrderBy(p => p.ProductId)
        };

        var products = await query.Take(limit).ToListAsync();
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null) return NotFound(new { Message = $"Product #{id} not found." });
        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Price <= 0)
        {
            return BadRequest(new { Message = "Valid product name and positive price are required." });
        }

        var product = new Product
        {
            Name = request.Name,
            Category = request.Category ?? "General",
            Description = request.Description ?? string.Empty,
            ImageUrl = request.ImageUrl ?? string.Empty,
            Price = request.Price,
            Rating = request.Rating > 0 ? request.Rating : 4.5,
            ReviewsCount = request.ReviewsCount,
            StockQuantity = request.StockQuantity > 0 ? request.StockQuantity : 100
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
    }
}

public record CreateProductDto(
    string Name,
    string? Category,
    string? Description,
    string? ImageUrl,
    decimal Price,
    double Rating,
    int ReviewsCount,
    int StockQuantity);

