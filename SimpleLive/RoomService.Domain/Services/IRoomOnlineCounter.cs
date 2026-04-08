using System;
using System.Collections.Generic;
using System.Text;

namespace RoomService.Domain.Services;

/// <summary>
/// 房间在线人数读取器 (数据由 InteractionService 维护)
/// </summary>
public interface IRoomOnlineCounter
{
    /// <summary>
    /// 获取单个房间的在线人数
    /// </summary>
    Task<long> GetOnlineCountAsync(string roomNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// 批量获取多个房间的在线人数 (用于首页列表)
    /// </summary>
    Task<IReadOnlyDictionary<string, long>> GetOnlineCountsAsync(IEnumerable<string> roomNumbers, CancellationToken cancellationToken = default);
}