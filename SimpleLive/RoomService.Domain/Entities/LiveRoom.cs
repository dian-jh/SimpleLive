using RoomService.Domain.DomainEvents;
using RoomService.Domain.Enums;
using ZD.DomainCommons.Models;

namespace RoomService.Domain.Entities;

public sealed class LiveRoom : Entity, IAggregateRoot
{
    public new Guid Id { get; private set; }
    public string RoomNumber { get; private set; } = string.Empty;
    public int CategoryId { get; private set; }

    public Guid HostId { get; private set; }
    public string HostUserName { get; private set; } = string.Empty;
    public string? HostAvatarUrl { get; private set; }

    public string Title { get; private set; } = string.Empty;
    public string? CoverImageUrl { get; private set; }
    public string StreamKey { get; private set; } = string.Empty;
    public string? CurrentStreamKey { get; private set; }
    public string? Notice { get; private set; }

    public LiveRoomStatus Status { get; private set; }
    public DateTime CreationTime { get; private set; }
    public DateTime? UpdationTime { get; private set; }

    private LiveRoom()
    {
    }

    public LiveRoom(
        Guid id,
        string roomNumber,
        int categoryId,
        Guid hostId,
        string hostUserName,
        string? hostAvatarUrl,
        string title,
        string? coverImageUrl,
        string streamKey,
        string? notice)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roomNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(hostUserName);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(streamKey);
        ArgumentOutOfRangeException.ThrowIfEqual(hostId, Guid.Empty);

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        RoomNumber = roomNumber.Trim();
        CategoryId = categoryId;
        HostId = hostId;
        HostUserName = hostUserName.Trim();
        HostAvatarUrl = Normalize(hostAvatarUrl);
        Title = title.Trim();
        CoverImageUrl = Normalize(coverImageUrl);
        StreamKey = streamKey.Trim();
        Notice = Normalize(notice);
        Status = LiveRoomStatus.Offline;
        CreationTime = DateTime.UtcNow;

        AddDomainEvent(new LiveRoomCreatedDomainEvent(Id, RoomNumber, HostId));
    }

    public void MarkLive(string currentStreamKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(currentStreamKey);

        var wasLive = Status == LiveRoomStatus.Live;
        Status = LiveRoomStatus.Live;
        CurrentStreamKey = currentStreamKey.Trim();
        UpdationTime = DateTime.UtcNow;

        if (!wasLive)
        {
            AddDomainEvent(new LiveRoomStartedDomainEvent(Id, RoomNumber, CurrentStreamKey));
        }
    }

    public void MarkOffline()
    {
        var wasLive = Status == LiveRoomStatus.Live;
        Status = LiveRoomStatus.Offline;
        CurrentStreamKey = null;
        UpdationTime = DateTime.UtcNow;

        if (wasLive)
        {
            AddDomainEvent(new LiveRoomOfflineDomainEvent(Id, RoomNumber));
        }
    }

    public void ReplaceStreamKey(string streamKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(streamKey);

        StreamKey = streamKey.Trim();
        UpdationTime = DateTime.UtcNow;
    }

    public void UpdateHostProfile(string hostUserName, string? hostAvatarUrl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(hostUserName);

        HostUserName = hostUserName.Trim();
        HostAvatarUrl = Normalize(hostAvatarUrl);
        UpdationTime = DateTime.UtcNow;
    }

    public void UpdateRoomMeta(string title, string? coverImageUrl, string? notice, int categoryId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        Title = title.Trim();
        CoverImageUrl = Normalize(coverImageUrl);
        Notice = Normalize(notice);
        CategoryId = categoryId;
        UpdationTime = DateTime.UtcNow;
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public void SetPreparing()
    {
        Status = LiveRoomStatus.Preparing;
        UpdationTime = DateTime.UtcNow;
    }

    public void UpdateLiveInfo(string title, int categoryId, string notice, string coverImageUrl)
    {
        this.Title = title;
        this.CategoryId = categoryId;
        this.Notice = notice;
        this.CoverImageUrl = coverImageUrl;
        UpdationTime = DateTime.UtcNow;
    }

    public void RefreshStreamKey(string streamKey)
    {
        this.StreamKey = streamKey;
        this.Status = LiveRoomStatus.Preparing;
        UpdationTime = DateTime.UtcNow;
    }
}
