using Microsoft.AspNetCore.Identity;
using ZD.DomainCommons.Models;
using UserService.Domain.Enums;
using DomainCommons;
using MediatR;
using UserService.Domain.Events.DomainEvents;

namespace UserService.Domain.Entities;

public sealed class User : IdentityUser<Guid>,IAggregateRoot,IHasDomainEvents
{
    public string NickName { get; private set; } = "Default NickName";
    public string? AvatarUrl { get; private set; }
    public DateOnly? DateOfBirth { get; private set; }
    public GenderType Gender { get; private set; } = GenderType.Unknown;
    public string? Location { get; private set; }
    public string? Signature { get; private set; }

    public int FollowingCount { get; private set; }
    public int FollowerCount { get; private set; }

    public DateTime CreationTime { get; private set; } = DateTime.UtcNow;
    public DateTime? UpdationTime { get; private set; }


    private List<INotification> _domainEvents;
    public IReadOnlyCollection<INotification> DomainEvents => _domainEvents?.AsReadOnly();
    private User()
    {
    }

    public User(string userName, string? email = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userName);

        Id = Guid.NewGuid();
        UserName = userName.Trim();
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        CreationTime = DateTime.UtcNow;
    }

    public void UpdateProfile(
        string nickName,
        string? signature,
        GenderType gender,
        DateOnly? dateOfBirth,
        string? location)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(nickName);

        this.NickName = nickName;
        this.Signature = signature ?? this.Signature;
        this.Gender = gender;
        this.DateOfBirth = dateOfBirth ?? this.DateOfBirth;
        this.Location = location ?? this.Location;
        this.UpdationTime = DateTime.UtcNow;

        AddDomainEvent(new UserProfileUpdatedDomainEvent(this.Id, this.NickName, this.AvatarUrl));
    }

    public void SetAvatar(string? avatarUrl)
    {
        AvatarUrl = Normalize(avatarUrl);
        UpdationTime = DateTime.UtcNow;
    }

    public void IncreaseFollowingCount()
    {
        FollowingCount++;
        UpdationTime = DateTime.UtcNow;
    }

    public void DecreaseFollowingCount()
    {
        if (FollowingCount > 0)
        {
            FollowingCount--;
            UpdationTime = DateTime.UtcNow;
        }
    }

    public void IncreaseFollowerCount()
    {
        FollowerCount++;
        UpdationTime = DateTime.UtcNow;
    }

    public void DecreaseFollowerCount()
    {
        if (FollowerCount > 0)
        {
            FollowerCount--;
            UpdationTime = DateTime.UtcNow;
        }
    }

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public void AddDomainEvent(INotification eventItem)
    {
        _domainEvents = _domainEvents ?? new List<INotification>();
        _domainEvents.Add(eventItem);
    }


    public void RemoveDomainEvent(INotification eventItem)
    {
        _domainEvents?.Remove(eventItem);
    }


    public void ClearDomainEvents()
    {
        _domainEvents?.Clear();
    }
}
