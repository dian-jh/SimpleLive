namespace UserService.API.Controllers.Request;

public sealed class RegisterRequest
{
    public string Account { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
