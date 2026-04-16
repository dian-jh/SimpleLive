using System;
using System.Collections.Generic;
using System.Text;

namespace RoomService.Domain.Services;

public interface ILiveRosterTracker
{
    // 将主播加入开播名单
    Task AddToLiveListAsync(Guid hostId, string roomNumber);

    // 将主播移出开播名单
    Task RemoveFromLiveListAsync(Guid hostId);
}