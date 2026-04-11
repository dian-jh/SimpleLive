using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RoomService.Domain;
using RoomService.Domain.Enums;
using RoomService.Infrastructure.Options;
using RoomService.WebAPI.Controllers.Requests;
using RoomService.WebAPI.Controllers.Responses;
using System.Security.Claims;

namespace RoomService.WebAPI.Controllers;

[ApiController]
[Route("api/liverooms")]
public sealed class LiveRoomsController : ControllerBase
{
    private readonly RoomDomainService _domainService;
    private readonly IOptions<LiveRoomOptions> _options;

    public LiveRoomsController(RoomDomainService domainService, IOptions<LiveRoomOptions> options)
    {
        _domainService = domainService;
        _options = options;
    }

    // 接口 1：获取推流信息（对应前端点击“选择OBS开播并下一步”）
    [HttpPost("prepare")]
    [Authorize]
    public async Task<IActionResult> Prepare(CancellationToken cancellationToken)
    {
        var hostIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(hostIdStr) || !Guid.TryParse(hostIdStr, out Guid hostId))
            return Unauthorized();

        var hostName = User.FindFirstValue(ClaimTypes.Name);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(Math.Max(1, _options.Value.StreamKeyExpireMinutes));

        var (success, room, errorMessage) = await _domainService.PrepareLiveStreamAsync(
            hostId: hostId,
            hostUserName: hostName ?? "未知用户",
            streamKeyExpiresAtUtc: expiresAt,
            cancellationToken: cancellationToken);

        if (!success || room is null)
            return BadRequest(new { Message = errorMessage });

        // 返回房间基础信息，供前端“开播设置页”回显（比如把上一次的标题填入输入框）
        var response = new
        {
            RoomNumber = room.RoomNumber,
            StreamKey = room.StreamKey,
            Title = room.Title,           // 让前端渲染到输入框
            CategoryId = room.CategoryId, // 让前端下拉框选中默认分类
            Notice = room.Notice
        };

        return Ok(response);
    }

    // 接口 2：保存开播设置（对应前端填完表单后，点击“开始直播”）
    [HttpPost("apply-settings")]
    [Authorize]
    public async Task<IActionResult> ApplySettings([FromBody] ApplyLiveSettingsRequest request, CancellationToken cancellationToken)
    {
        var hostIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(hostIdStr) || !Guid.TryParse(hostIdStr, out Guid hostId))
            return Unauthorized();

        var (success, errorMessage) = await _domainService.ApplyLiveSettingsAsync(
            hostId: hostId,
            title: request.Title,
            categoryId: request.CategoryId,
            notice: request.Notice,
            coverImageUrl: request.CoverImageUrl,
            cancellationToken: cancellationToken);

        if (!success)
            return BadRequest(new { Message = errorMessage });

        return Ok(); // 成功保存，前端可以提示“设置成功，请在 OBS 中开始推流”
    }

    [HttpGet("home")]
    public async Task<IActionResult> GetHome(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? categoryId = null,
        CancellationToken cancellationToken = default)
    {
        var items = await _domainService.GetLiveHomeAsync(pageIndex, pageSize, categoryId, cancellationToken);
        var responses = items.Select(x => new LiveRoomCardResponse
        {
            Id = x.Id,
            RoomNumber = x.RoomNumber,
            CategoryId = x.CategoryId,
            HostUserName = x.HostUserName,
            HostAvatarUrl = x.HostAvatarUrl,
            Title = x.Title,
            CoverImageUrl = x.CoverImageUrl,
            Notice = x.Notice,
            Status = x.Status,
            OnlineCount = x.OnlineCount
        }).ToList();

        return Ok(responses);
    }

    [HttpGet("{roomNumber}")]
    [Authorize]
    public async Task<IActionResult> GetDetail([FromRoute] string roomNumber, CancellationToken cancellationToken)
    {
        var (success, detail, errorMessage) = await _domainService.GetLiveRoomDetailAsync(roomNumber, cancellationToken);
        if (!success || detail is null)
        {
            return NotFound(new { Message = errorMessage });
        }

        string? playUrl = null;
        if (detail.Status == LiveRoomStatus.Live && !string.IsNullOrWhiteSpace(detail.CurrentStreamKey))
        {
            playUrl = $"http://{_options.Value.SrsIp}:{_options.Value.SrsHttpFlvPort}/live/{detail.CurrentStreamKey}.flv";
        }

        var response = new LiveRoomDetailResponse
        {
            Id = detail.Id,
            RoomNumber = detail.RoomNumber,
            CategoryId = detail.CategoryId,
            HostId = detail.HostId,
            HostUserName = detail.HostUserName,
            HostAvatarUrl = detail.HostAvatarUrl,
            Title = detail.Title,
            CoverImageUrl = detail.CoverImageUrl,
            Notice = detail.Notice,
            Status = detail.Status,
            OnlineCount = detail.OnlineCount,
            PlayUrl = playUrl
        };
        return Ok(response);
    }

}
