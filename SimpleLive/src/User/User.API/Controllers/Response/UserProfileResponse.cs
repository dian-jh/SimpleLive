using UserService.Domain.Enums;
using AppUser = UserService.Domain.Entities.User;

namespace UserService.API.Controllers.Response;

public sealed record UserProfileResponse(
    Guid UserId,
    string UserName,
    string NickName,
    string? AvatarUrl,
    int? Age,
    GenderType Gender,
    DateOnly? DateOfBirth,
    string? Location,
    string? Signature,
    int FollowingCount,
    int FollowerCount)
{
    public static UserProfileResponse From(AppUser user)
    {
        return new UserProfileResponse(
            user.Id,
            user.UserName ?? string.Empty,
            user.NickName,
            user.AvatarUrl,
            GetAge(user.DateOfBirth),
            user.Gender,
            user.DateOfBirth,
            user.Location,
            user.Signature,
            user.FollowingCount,
            user.FollowerCount);
    }

    private static int? GetAge(DateOnly? dateOfBirth)
    {
        if (!dateOfBirth.HasValue)
        {
            return null;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - dateOfBirth.Value.Year;

        if (today < dateOfBirth.Value.AddYears(age))
        {
            age--;
        }

        return age;
    }
}
