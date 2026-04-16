using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserService.API.Controllers.Request;
using UserService.API.Services;
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
    private readonly UserProfileQueryService _queryService;

    public UserProfileController(UserDomainService domainService, IUserRepository repository,
        UserProfileQueryService queryService)
    {
        _domainService = domainService;
        _repository = repository;
        _queryService = queryService;   
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        // 从 JWT Token 中解析出 UserId
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _repository.FindByIdAsync(Guid.Parse(userIdStr));

        if (user == null) return NotFound();

        // 组装展示 DTO
        var response = new
        {
            AvatarUrl = user.AvatarUrl,
            NickName = user.NickName,
            DateOfBirth = user.DateOfBirth,  // 动态计算的年龄
            Gender = user.Gender,
            Location = user.Location,
            Signature = user.Signature,
            FollowingCount = user.FollowingCount
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


    [HttpGet("follows")]
    public async Task<IActionResult> GetMyFollows([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // 调用 API 层的 QueryService 拿数据，直接返回
        var result = await _queryService.GetMyFollowingListAsync(userId, pageIndex, pageSize);
        return Ok(result);
    }

    [HttpPost("history/{roomNumber}")]
    [Transactional]
    public async Task<IActionResult> RecordHistory([FromRoute] string roomNumber)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // 调用 Domain 层执行动作
        var (success, errorMsg) = await _domainService.RecordWatchHistoryAsync(userId, roomNumber);

        if (!success) return BadRequest(new { Message = errorMsg });
        return Ok();
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        // 调用 API 层的 QueryService 拿数据，直接返回
        var result = await _queryService.GetMyWatchHistoryAsync(userId, pageIndex, pageSize);
        return Ok(result);
    }
}