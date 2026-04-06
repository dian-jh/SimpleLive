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

[Authorize]
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLiveRoomRequest request, CancellationToken cancellationToken)
    {
        var hostIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(hostIdStr) || !Guid.TryParse(hostIdStr, out Guid hostId))
            return Unauthorized();
        var hostName = User.FindFirstValue(ClaimTypes.Name);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(Math.Max(1, _options.Value.StreamKeyExpireMinutes));
        var (success, room, errorMessage) = await _domainService.PrepareLiveStreamAsync(
            categoryId: request.CategoryId,
            hostId: hostId,
            hostUserName: hostName ?? "未知用户",
            hostAvatarUrl: request.HostAvatarUrl,
            title: request.Title,
            coverImageUrl: request.CoverImageUrl,
            notice: request.Notice,
            streamKeyExpiresAtUtc: expiresAt,
            cancellationToken: cancellationToken);

        if (!success || room is null)
        {
            return BadRequest(new { Message = errorMessage });
        }

        var response = new CreateLiveRoomResponse
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            StreamKey = room.StreamKey,// 把最新生成的推流码给前端
            Status = room.Status
        };
        return Ok(response);
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

    [HttpPost("{roomNumber}/heartbeat")]
    public async Task<IActionResult> Heartbeat(
        [FromRoute] string roomNumber,
        [FromBody] HeartbeatRequest request,
        CancellationToken cancellationToken)
    {
        var (success, heartbeat, errorMessage) = await _domainService.HandleHeartbeatAsync(
            roomNumber: roomNumber,
            viewerId: request.ViewerId,
            cancellationToken: cancellationToken);

        if (!success || heartbeat is null)
        {
            return BadRequest(new { Message = errorMessage });
        }

        return Ok(new RoomHeartbeatResponse
        {
            RoomNumber = heartbeat.RoomNumber,
            ViewerId = heartbeat.ViewerId,
            OnlineCount = heartbeat.OnlineCount
        });
    }
}
