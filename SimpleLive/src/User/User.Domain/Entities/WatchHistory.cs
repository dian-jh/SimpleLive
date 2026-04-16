using System;
using System.Collections.Generic;
using System.Text;
using ZD.DomainCommons.Models;

namespace UserService.Domain.Entities;

public class WatchHistory : Entity, IAggregateRoot
{
    public new Guid Id { get; private set; }
    public Guid UserId { get; private set; }     // 谁看的
    public string RoomNumber { get; private set; } = string.Empty; // 看了哪个房间
    public DateTime LastWatchTime { get; private set; } // 最后观看时间

    private WatchHistory() { } // 给 EF Core 留的空构造

    public WatchHistory(Guid userId, string roomNumber)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roomNumber);

        Id = Guid.NewGuid();
        UserId = userId;
        RoomNumber = roomNumber.Trim();
        LastWatchTime = DateTime.UtcNow;
    }

    // 充血模型行为：更新观看时间
    public void UpdateLastWatchTime()
    {
        LastWatchTime = DateTime.UtcNow;
    }
}