using UserService.Domain.Enums;

namespace UserService.API.Controllers.Request;

public sealed class UpdateProfileRequest
{
    public string NickName { get; set; } = string.Empty;
    public string? Signature { get; set; }
    public GenderType Gender { get; set; } = GenderType.Unknown;
    public DateOnly? DateOfBirth { get; set; }
    public string? Location { get; set; }
}
