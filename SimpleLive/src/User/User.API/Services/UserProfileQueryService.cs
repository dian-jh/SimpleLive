using System.Linq.Dynamic.Core;
using UserService.API.Controllers.Response;
using UserService.Domain;

namespace UserService.API.Services;

public class UserProfileQueryService
{
    private readonly IWatchHistoryRepository _watchHistoryRepository;
    private readonly IUserFollowRepository _followRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILiveStatusChecker _liveStatusChecker;

    public UserProfileQueryService(
        IWatchHistoryRepository watchHistoryRepository,
        IUserFollowRepository followRepository,
        IUserRepository userRepository,
        ILiveStatusChecker liveStatusChecker)
    {
        _watchHistoryRepository = watchHistoryRepository;
        _followRepository = followRepository;
        _userRepository = userRepository;
        _liveStatusChecker = liveStatusChecker;
    }

    /// <summary>
    /// 获取关注列表：直播状态 > 观众人数 > 粉丝数
    /// </summary>
    public async Task<PagedResult<FollowingUserResponse>> GetMyFollowingListAsync(
        Guid userId, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        // 1. 拿到所有关注的主播 ID
        var allIds = await _followRepository.GetAllFollowingUserIdsAsync(userId, cancellationToken);
        if (!allIds.Any())
        {
            return new PagedResult<FollowingUserResponse>
            {
                Queryable = Enumerable.Empty<FollowingUserResponse>().AsQueryable(),
                CurrentPage = pageIndex,
                PageSize = pageSize,
                RowCount = 0,
                PageCount = 0
            };
        }

        // 2. 批量获取主播基本信息 (含粉丝数)
        var profiles = await _userRepository.GetUsersByIdsAsync(allIds);

        // 3. 批量获取直播状态和人数 (走刚才修改好的 Redis Hash + SetLength 逻辑)
        var statusDict = await _liveStatusChecker.GetLiveStatusesBatchAsync(allIds);

        // 4. 多维排序
        var sorted = profiles.Select(p => {
            statusDict.TryGetValue(p.Id, out var status);
            return new
            {
                Profile = p,
                IsLive = status.IsLive,
                ViewerCount = status.ViewerCount
            };
        })
        .OrderByDescending(x => x.IsLive)
        .ThenByDescending(x => x.ViewerCount)
        .ThenByDescending(x => x.Profile.FollowerCount)
        .ToList();

        // 5. 分页截取并映射 Response
        var items = sorted
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new FollowingUserResponse
            {
                HostId = x.Profile.Id,
                NickName = x.Profile.NickName,
                AvatarUrl = x.Profile.AvatarUrl,
                IsLive = x.IsLive,
                ViewerCount = x.ViewerCount,
                FollowerCount = x.Profile.FollowerCount
            }).ToList();

        return new PagedResult<FollowingUserResponse>
        {
            Queryable = items.AsQueryable(), // 关键：将 List 转换为 IQueryable
            CurrentPage = pageIndex,
            PageSize = pageSize,
            RowCount = sorted.Count,
            PageCount = (int)Math.Ceiling((double)sorted.Count / pageSize) // 计算总页数
        };
    }

    /// <summary>
    /// 获取观看历史：按时间倒序
    /// </summary>
    public async Task<PagedResult<WatchHistoryResponse>> GetMyWatchHistoryAsync(
        Guid userId, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        var total = await _watchHistoryRepository.GetHistoryCountAsync(userId, cancellationToken);
        var list = await _watchHistoryRepository.GetHistoryAsync(userId, pageIndex, pageSize, cancellationToken);

        var items = list.Select(x => new WatchHistoryResponse
        {
            RoomNumber = x.RoomNumber,
            LastWatchTime = x.LastWatchTime
        }).ToList();

        return new PagedResult<WatchHistoryResponse>
        {
            Queryable = items.AsQueryable(), // 转换为 IQueryable
            CurrentPage = pageIndex,
            PageSize = pageSize,
            RowCount = total,
            PageCount = (int)Math.Ceiling((double)total / pageSize)
        };
    }
}