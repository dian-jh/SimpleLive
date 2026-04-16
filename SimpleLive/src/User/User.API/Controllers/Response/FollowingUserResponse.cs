namespace UserService.API.Controllers.Response;

public class FollowingUserResponse
{
    public Guid HostId { get; set; }
    public string NickName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsLive { get; set; }
    public int ViewerCount { get; set; }
    public int FollowerCount { get; set; } // 用于排序，前端可以选择不展示
}