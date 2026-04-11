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

    // 方法 1：点击“下一步”时调用。只负责发牌（分配房间、生成推流码）
    public async Task<(bool Success, LiveRoom? Room, string ErrorMessage)> PrepareLiveStreamAsync(
    Guid hostId,
    string hostUserName,
    DateTimeOffset streamKeyExpiresAtUtc, // 这个参数可以保留，用于生成新码时设置过期时间
    CancellationToken cancellationToken = default)
    {
        var room = await _repository.FindByHostIdAsync(hostId, cancellationToken);

        if (room is null)
        {
            // ==========================================
            // 场景 A：新主播首次开播，分配房间并生成推流码
            // ==========================================
            var roomNumber = await _roomNumberGenerator.GenerateNextAsync(cancellationToken);

            // 生成全新的推流码
            var streamKeyPayload = new StreamKeyPayload(roomNumber, hostId, streamKeyExpiresAtUtc);
            var streamKey = _streamKeyTokenService.Encrypt(streamKeyPayload);

            string defaultTitle = $"{hostUserName}的直播间";

            room = new LiveRoom(
                id: Guid.NewGuid(),
                roomNumber: roomNumber,
                categoryId: 1,
                hostId: hostId,
                hostUserName: hostUserName,
                hostAvatarUrl: null,
                title: defaultTitle,
                coverImageUrl: null,
                streamKey: streamKey,
                notice: null);

            room.SetPreparing();
            _repository.Add(room);
        }
        else
        {
            // ==========================================
            // 场景 B：老主播进入开播设置页
            // ==========================================

            // 1. 如果正在直播中，绝对不能刷新推流码！直接放行。
            if (room.Status == LiveRoomStatus.Live)
            {
                // 什么都不做，保持现有状态，直接跳到最后的 Save
            }
            else
            {
                // 尝试解密现在的推流码，看看有没有过期
                bool isValid = _streamKeyTokenService.TryDecrypt(room.StreamKey, out var payload, out var errorMessage);

                // 只有在两种情况下才生成新码：
                // 1. 旧码无法解密（isValid 为 false，通常是因为数据被破坏、篡改或格式错误）
                // 2. 旧码已经过了有效期
                if (!isValid || payload == null || payload.ExpiresAtUtc <= DateTimeOffset.UtcNow)
                {
                    // 生成新的动态 AES 推流码
                    var newStreamKeyPayload = new StreamKeyPayload(room.RoomNumber, hostId, streamKeyExpiresAtUtc);
                    var newStreamKey = _streamKeyTokenService.Encrypt(newStreamKeyPayload);

                    room.RefreshStreamKey(newStreamKey);
                }
                else
                {
                    // 没过期，继续复用旧码，但要把状态切回 Preparing（应对从 Offline 进来的情况）
                    room.SetPreparing();
                }

                _repository.Update(room);
            }
        }

        await _repository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
        return (true, room, string.Empty);
    }

    // 方法 2：点击“开始直播”时调用。只负责保存直播间的信息设置
    public async Task<(bool Success, string ErrorMessage)> ApplyLiveSettingsAsync(
        Guid hostId,
        string title,
        int categoryId,
        string? notice,
        string? coverImageUrl,
        CancellationToken cancellationToken = default)
    {
        var room = await _repository.FindByHostIdAsync(hostId, cancellationToken);

        if (room is null)
        {
            return (false, "请先获取直播推流信息");
        }

        // 调用你实体中已经存在的充血模型方法
        room.UpdateRoomMeta(title, coverImageUrl, notice, categoryId);

        _repository.Update(room);
        await _repository.UnitOfWork.SaveEntitiesAsync(cancellationToken);

        return (true, string.Empty);
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
