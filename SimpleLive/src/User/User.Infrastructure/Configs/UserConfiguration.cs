using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AppUser = UserService.Domain.Entities.User;

namespace UserService.Infrastructure.Configs;

public sealed class UserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("T_Users");

        builder.Property(u => u.NickName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(u => u.Location)
            .HasMaxLength(100);

        builder.Property(u => u.Signature)
            .HasMaxLength(200);

        builder.Property(u => u.Gender)
            .HasConversion<int>();

        builder.Property(u => u.FollowingCount)
            .HasDefaultValue(0);

        builder.Property(u => u.FollowerCount)
            .HasDefaultValue(0);

        builder.Property(u => u.CreationTime)
            .IsRequired();
    }
}
