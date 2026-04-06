using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserService.API.Controllers.Request;
using UserService.Domain;
using ZD.Transaction;

namespace UserService.API.Controllers;

[Authorize] // 必须携带 JWT 才能访问
[ApiController]
[Route("api/[controller]")]
public class UserProfileController : ControllerBase
{
    private readonly UserDomainService _domainService;
    private readonly IUserRepository _repository;

    public UserProfileController(UserDomainService domainService, IUserRepository repository)
    {
        _domainService = domainService;
        _repository = repository;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        // 从 JWT Token 中解析出 UserId
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _repository.FindByIdAsync(Guid.Parse(userIdStr));

        if (user == null) return NotFound();

        // ！！！核心逻辑：年龄绝对不查数据库，而是根据生日实时推算！！！
        int? calculatedAge = null;

        if (user.DateOfBirth.HasValue)
        {
            var today = DateOnly.FromDateTime(DateTime.Now); // 获取今天的日期
            var birthDate = user.DateOfBirth.Value;

            int age = today.Year - birthDate.Year;

            // 如果生日还没到，今年还没满，age 减 1
            if (today < birthDate.AddYears(age))
            {
                age--;
            }

            calculatedAge = age;
        }

        // 组装展示 DTO
        var response = new
        {
            AvatarUrl = user.AvatarUrl,
            NickName = user.NickName,
            Age = calculatedAge,  // 动态计算的年龄
            Gender = user.Gender,
            Location = user.Location,
            Signature = user.Signature,
            FollowingCount = user.FollowingCount,
            FollowerCount = user.FollowerCount
        };

        return Ok(response);
    }

    [HttpPut("me")]
    [Transactional]//事务特性，确保更新操作的原子性，并且发布集成事件
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var (success, errorMsg) = await _domainService.UpdateProfileAsync(
            Guid.Parse(userIdStr),
            request.NickName,
            request.Signature,
            request.Gender,
            request.DateOfBirth, // 前端传过来的是生日，而不是年龄
            request.Location
        );

        if (!success) return BadRequest(new { Message = errorMsg });

        return Ok();
    }
}