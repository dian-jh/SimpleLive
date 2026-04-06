using FluentValidation;
using RoomService.WebAPI.Controllers.Requests;

namespace RoomService.WebAPI.Validators;

public sealed class CreateLiveRoomRequestValidator : AbstractValidator<CreateLiveRoomRequest>
{
    public CreateLiveRoomRequestValidator()
    {
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CoverImageUrl).MaximumLength(512);
        RuleFor(x => x.HostAvatarUrl).MaximumLength(512);
        RuleFor(x => x.Notice).MaximumLength(500);
    }
}

public sealed class HeartbeatRequestValidator : AbstractValidator<HeartbeatRequest>
{
    public HeartbeatRequestValidator()
    {
        RuleFor(x => x.ViewerId).NotEmpty().MaximumLength(128);
    }
}

public sealed class SrsWebhookRequestValidator : AbstractValidator<SrsWebhookRequest>
{
    public SrsWebhookRequestValidator()
    {
        RuleFor(x => x.Stream).NotEmpty().MaximumLength(1024);
    }
}
