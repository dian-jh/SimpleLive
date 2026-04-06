using RoomService.Domain.Entities;
using RoomService.Domain.Enums;
using RoomService.Domain.Services;

namespace RoomService.Domain;

public sealed class RoomDomainService
{
    private readonly IRoomRepository _repository;
    private readonly IRoomNumberGenerator _roomNumberGenerator;
    private readonly IStreamKeyTokenService _streamKeyTokenService;
    private readonly IRoomOnlineCounter _roomOnlineCounter;

    public RoomDomainService(
        IRoomRepository repository,
        IRoomNumberGenerator roomNumberGenerator,
        IStreamKeyTokenService streamKeyTokenService,
        IRoomOnlineCounter roomOnlineCounter)
    {
        _repository = repository;
        _roomNumberGenerator = roomNumberGenerator;
        _streamKeyTokenService = streamKeyTokenService;
        _roomOnlineCounter = roomOnlineCounter;
    }

    public async Task<(bool Success, LiveRoom? Room, string ErrorMessage)> PrepareLiveStreamAsync(
     int categoryId,
     Guid hostId,
     string hostUserName,
     string? hostAvatarUrl,
     string title,
     string? coverImageUrl,
     string? notice,
     DateTimeOffset streamKeyExpiresAtUtc,
     CancellationToken cancellationToken = default)
    {
        // 1. 查：该主播是否已经有固定的直播间了？
        var room = await _repository.FindByHostIdAsync(hostId, cancellationToken);

        if (room is null)
        {
            // ==========================================
            // 场景 A：该主播【首次开播】，创建全新的专属房间
            // ==========================================
            var roomNumber = await _roomNumberGenerator.GenerateNextAsync(cancellationToken);

            // 生成动态 AES 推流码
            var streamKeyPayload = new StreamKeyPayload(roomNumber, hostId, streamKeyExpiresAtUtc);
            var streamKey = _streamKeyTokenService.Encrypt(streamKeyPayload);

            // 初始化实体
            room = new LiveRoom(
                id: Guid.NewGuid(),
                roomNumber: roomNumber,
                categoryId: categoryId,
                hostId: hostId,
                hostUserName: hostUserName,
                hostAvatarUrl: hostAvatarUrl,
                title: title,
                coverImageUrl: coverImageUrl,
                streamKey: streamKey,
                notice: notice);

            room.SetPreparing(); // 明确声明状态切换为“准备中”

            _repository.Add(room); // 追踪新增
        }
        else
        {
            // ==========================================
            // 场景 B：老主播【日常开播】，复用房间号，刷新推流码
            // ==========================================

            // 重新生成新的动态 AES 推流码（防盗播核心）
            var streamKeyPayload = new StreamKeyPayload(room.RoomNumber, hostId, streamKeyExpiresAtUtc);
            var streamKey = _streamKeyTokenService.Encrypt(streamKeyPayload);

            // 充血模型：更新这次开播填写的新标题、分区、公告等
            room.UpdateLiveInfo(title, categoryId, notice, coverImageUrl);

            // 充血模型：覆盖新推流码，并将状态切回“准备中”
            room.RefreshStreamKey(streamKey);
            room.SetPreparing();

            _repository.Update(room); // 追踪修改
        }

        // 2. 统一保存：不管是新增还是修改，都在这里一次性提交数据库
        await _repository.UnitOfWork.SaveEntitiesAsync(cancellationToken);

        return (true, room, string.Empty);
    }

    public async Task<(bool Success, string ErrorMessage)> HandleOnPublishAsync(
        string encryptedStreamToken,
        DateTimeOffset nowUtc,
        CancellationToken cancellationToken = default)
    {
        var (success, _, errorMessage) = await MarkRoomLiveByStreamTokenAsync(
            encryptedStreamToken,
            nowUtc,
            cancellationToken);

        if (!success)
        {
            return (false, errorMessage);
        }

        await _repository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
        return (true, string.Empty);
    }

    public async Task<(bool Success, string ErrorMessage)> HandleOnUnpublishAsync(
        string encryptedStreamToken,
        CancellationToken cancellationToken = default)
    {
        var (success, _, errorMessage) = await MarkRoomOfflineByStreamTokenAsync(encryptedStreamToken, cancellationToken);
        if (!success)
        {
            return (false, errorMessage);
        }

        await _repository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
        return (true, string.Empty);
    }

    public async Task<IReadOnlyList<LiveRoomHomeItem>> GetLiveHomeAsync(
        int pageIndex,
        int pageSize,
        int? categoryId,
        CancellationToken cancellationToken = default)
    {
        var normalizedPageIndex = pageIndex <= 0 ? 1 : pageIndex;
        var normalizedPageSize = pageSize <= 0 ? 20 : pageSize;

        var rooms = await _repository.GetByStatusAsync(
            status: LiveRoomStatus.Live,
            categoryId: categoryId,
            pageIndex: normalizedPageIndex,
            pageSize: normalizedPageSize,
            cancellationToken: cancellationToken);

        var onlineMap = await _roomOnlineCounter.GetOnlineCountsAsync(rooms.Select(x => x.RoomNumber), cancellationToken);

        return rooms
            .Select(room =>
            {
                onlineMap.TryGetValue(room.RoomNumber, out var onlineCount);
                return new LiveRoomHomeItem(
                    Id: room.Id,
                    RoomNumber: room.RoomNumber,
                    CategoryId: room.CategoryId,
                    HostUserName: room.HostUserName,
                    HostAvatarUrl: room.HostAvatarUrl,
                    Title: room.Title,
                    CoverImageUrl: room.CoverImageUrl,
                    Notice: room.Notice,
                    Status: room.Status,
                    OnlineCount: onlineCount);
            })
            .OrderByDescending(x => x.OnlineCount)
            .ThenByDescending(x => x.Id)
            .ToList();
    }

    public async Task<(bool Success, LiveRoomDetailResult? Detail, string ErrorMessage)> GetLiveRoomDetailAsync(
        string roomNumber,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(roomNumber))
        {
            return (false, null, "房间号不能为空");
        }

        var room = await _repository.FindByRoomNumberAsync(roomNumber.Trim(), cancellationToken);
        if (room is null)
        {
            return (false, null, "直播间不存在");
        }

        var onlineCount = await _roomOnlineCounter.GetOnlineCountAsync(room.RoomNumber, cancellationToken);
        var detail = new LiveRoomDetailResult(
            Id: room.Id,
            RoomNumber: room.RoomNumber,
            CategoryId: room.CategoryId,
            HostId: room.HostId,
            HostUserName: room.HostUserName,
            HostAvatarUrl: room.HostAvatarUrl,
            Title: room.Title,
            CoverImageUrl: room.CoverImageUrl,
            Notice: room.Notice,
            Status: room.Status,
            OnlineCount: onlineCount,
            CurrentStreamKey: room.CurrentStreamKey);

        return (true, detail, string.Empty);
    }

    public async Task<(bool Success, RoomHeartbeatResult? Result, string ErrorMessage)> HandleHeartbeatAsync(
        string roomNumber,
        string viewerId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(roomNumber))
        {
            return (false, null, "房间号不能为空");
        }

        if (string.IsNullOrWhiteSpace(viewerId))
        {
            return (false, null, "观众标识不能为空");
        }

        var room = await _repository.FindByRoomNumberAsync(roomNumber.Trim(), cancellationToken);
        if (room is null)
        {
            return (false, null, "直播间不存在");
        }

        var onlineCount = await _roomOnlineCounter.HeartbeatAsync(room.RoomNumber, viewerId.Trim(), cancellationToken);
        return (true, new RoomHeartbeatResult(room.RoomNumber, viewerId.Trim(), onlineCount), string.Empty);
    }

    public async Task<int> SyncHostProfileAndSaveAsync(
        Guid hostId,
        string hostUserName,
        string? hostAvatarUrl,
        CancellationToken cancellationToken = default)
    {
        var updatedCount = await SyncHostProfileAsync(hostId, hostUserName, hostAvatarUrl, cancellationToken);
        if (updatedCount <= 0)
        {
            return 0;
        }

        await _repository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
        return updatedCount;
    }

    private async Task<(bool Success, LiveRoom? Room, string ErrorMessage)> MarkRoomLiveByStreamTokenAsync(
        string encryptedStreamToken,
        DateTimeOffset nowUtc,
        CancellationToken cancellationToken = default)
    {
        if (!_streamKeyTokenService.TryDecrypt(encryptedStreamToken, out var payload, out var errorMessage))
        {
            return (false, null, errorMessage ?? "推流鉴权失败");
        }

        if (payload is null)
        {
            return (false, null, "推流鉴权失败");
        }

        if (payload.ExpiresAtUtc <= nowUtc)
        {
            return (false, null, "推流密钥已过期");
        }

        var room = await _repository.FindByRoomNumberAsync(payload.RoomNumber, cancellationToken);
        if (room is null)
        {
            return (false, null, "直播间不存在");
        }

        if (room.HostId != payload.HostId)
        {
            return (false, null, "推流密钥与主播不匹配");
        }

        if (!string.Equals(room.StreamKey, encryptedStreamToken, StringComparison.Ordinal))
        {
            return (false, null, "推流密钥不是当前有效密钥");
        }

        room.MarkLive(encryptedStreamToken);
        return (true, room, string.Empty);
    }

    private async Task<(bool Success, LiveRoom? Room, string ErrorMessage)> MarkRoomOfflineByStreamTokenAsync(
        string encryptedStreamToken,
        CancellationToken cancellationToken = default)
    {
        if (!_streamKeyTokenService.TryDecrypt(encryptedStreamToken, out var payload, out var errorMessage))
        {
            return (false, null, errorMessage ?? "推流鉴权失败");
        }

        if (payload is null)
        {
            return (false, null, "推流鉴权失败");
        }

        var room = await _repository.FindByRoomNumberAsync(payload.RoomNumber, cancellationToken);
        if (room is null)
        {
            return (false, null, "直播间不存在");
        }

        if (room.HostId != payload.HostId)
        {
            return (false, null, "推流密钥与主播不匹配");
        }

        room.MarkOffline();
        return (true, room, string.Empty);
    }

    private async Task<int> SyncHostProfileAsync(
        Guid hostId,
        string hostUserName,
        string? hostAvatarUrl,
        CancellationToken cancellationToken = default)
    {
        var rooms = await _repository.GetByHostIdAsync(hostId, cancellationToken);
        foreach (var room in rooms)
        {
            room.UpdateHostProfile(hostUserName, hostAvatarUrl);
        }

        return rooms.Count;
    }
}
