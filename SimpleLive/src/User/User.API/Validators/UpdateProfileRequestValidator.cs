using FluentValidation;
using UserService.API.Controllers.Request;

namespace UserService.API.Validators;

public sealed class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(request => request.NickName)
            .NotEmpty()
            .WithMessage("昵称不能为空。")
            .MaximumLength(50)
            .WithMessage("昵称长度不能超过50。");

        RuleFor(request => request.Signature)
            .MaximumLength(200)
            .WithMessage("个性签名不能超过200字。");

        RuleFor(request => request.Location)
            .MaximumLength(100)
            .WithMessage("所在地不能超过100字。");

        RuleFor(request => request.Gender)
            .IsInEnum()
            .WithMessage("性别类型无效。");

        RuleFor(request => request.DateOfBirth)
            .LessThanOrEqualTo(_ => DateOnly.FromDateTime(DateTime.Now))
            .WithMessage("生日不能晚于今天。")
            .When(request => request.DateOfBirth.HasValue);

        RuleFor(request => request.DateOfBirth)
            .GreaterThanOrEqualTo(new DateOnly(1900, 1, 1))
            .WithMessage("生日日期不合法。")
            .When(request => request.DateOfBirth.HasValue);
    }
}
