using Microsoft.AspNetCore.Mvc;
using UserService.Domain;
using ZD.JWT;
using UserService.API.Controllers.Request;
using System.Security.Principal;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserDomainService _domainService;
    private readonly IJwtTokenService _jwtService;

    public AuthController(UserDomainService domainService, IJwtTokenService jwtService)
    {
        _domainService = domainService;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        string Account = request.Email == null ? request.UserName : request.Email;
        var (success, errorMsg) = await _domainService.RegisterAsync(Account, request.Password);

        if (!success)
            return BadRequest(new { Message = errorMsg }); // 遵循 RESTful，失败返回 400

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, user, errorMsg) = await _domainService.LoginAsync(request.Account, request.Password);

        if (!success || user == null)
            return Unauthorized(new { Message = errorMsg }); // 密码错误返回 401

        // 登录成功，颁发 JWT Token (调用你的公共扩展方法)
        var token = _jwtService.GenerateToken(user.Id, user.UserName);

        return Ok(new { Token = token });
    }
}