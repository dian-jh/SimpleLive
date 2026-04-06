namespace UserService.API.Controllers.Request;

public sealed class RegisterRequest
{
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; } = string.Empty;
}
