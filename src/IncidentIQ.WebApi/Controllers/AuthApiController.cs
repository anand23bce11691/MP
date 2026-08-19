using IncidentIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentIQ.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthApiController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthApiController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
        {
            user = await _db.Users.FirstOrDefaultAsync();
        }

        return Ok(new
        {
            Token = "mock_jwt_token_12345",
            User = new { user?.UserId, user?.Username, user?.Email }
        });
    }
}

public record LoginRequest(string Username, string Password);
