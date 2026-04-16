using System;
using System.Collections.Generic;
using System.Text;

namespace UserService.Domain;

public interface ILiveStatusChecker
{
    /// <summary>
    /// 批量获取主播的开播状态和观众人数
    /// </summary>
    /// <returns>字典：Key是主播ID，Value是(是否开播, 观众人数)</returns>
    Task<Dictionary<Guid, (bool IsLive, int ViewerCount)>> GetLiveStatusesBatchAsync(IEnumerable<Guid> hostIds);
}