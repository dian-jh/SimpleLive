using System;
using System.Collections.Generic;
using System.Text;
using ZD.DomainCommons.Models;

namespace UserService.Domain.Entities;

public class UserFollow : Entity, IAggregateRoot
{
    public new Guid Id { get; private set; }
    public Guid UserId { get; private set; }      // 谁发起的关注 (粉丝)
    public Guid TargetUserId { get; private set; } // 关注了谁 (被关注的主播)
    public DateTime FollowTime { get; private set; } // 关注时间（用于按时间倒序排列表）

    private UserFollow() { } // 给 EF Core 留的空构造

    public UserFollow(Guid userId, Guid targetUserId)
    {
        if (userId == targetUserId) throw new ArgumentException("不能关注自己");

        Id = Guid.NewGuid();
        UserId = userId;
        TargetUserId = targetUserId;
        FollowTime = DateTime.UtcNow;
    }
}