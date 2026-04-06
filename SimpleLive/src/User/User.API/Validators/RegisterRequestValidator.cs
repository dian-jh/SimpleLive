using FluentValidation;
using UserService.API.Controllers.Request;

namespace UserService.API.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    private const string UserNamePattern = @"^(?=.{8,20}$)(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9][A-Za-z0-9._-]*$";
    private const string PasswordPattern = @"^(?=.*[A-Za-z])(?=.*\d).{8,}$";

    public RegisterRequestValidator()
    {
        RuleFor(request => request)
            .Must(request => !string.IsNullOrWhiteSpace(request.UserName) || !string.IsNullOrWhiteSpace(request.Email))
            .WithMessage("UserName 或 Email 至少填写一项。");

        When(request => !string.IsNullOrWhiteSpace(request.UserName), () =>
        {
            RuleFor(request => request.UserName!)
                .Matches(UserNamePattern)
                .WithMessage("UserName 必须为8-20位，包含字母和数字，且以字母或数字开头。");
        });

        When(request => !string.IsNullOrWhiteSpace(request.Email), () =>
        {
            RuleFor(request => request.Email!)
                .EmailAddress()
                .WithMessage("Email 格式不正确。");
        });

        RuleFor(request => request.Password)
            .NotEmpty()
            .WithMessage("密码不能为空。")
            .Matches(PasswordPattern)
            .WithMessage("密码至少8位，且必须包含字母和数字。");
    }
}
