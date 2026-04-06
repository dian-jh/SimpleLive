using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoomService.Domain.Entities;

namespace RoomService.Infrastructure.Configs;

public sealed class LiveRoomConfiguration : IEntityTypeConfiguration<LiveRoom>
{
    public void Configure(EntityTypeBuilder<LiveRoom> builder)
    {
        builder.ToTable("T_LiveRooms");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RoomNumber)
            .IsRequired()
            .HasMaxLength(16);
        builder.HasIndex(x => x.RoomNumber).IsUnique();

        builder.Property(x => x.CategoryId).IsRequired();
        builder.HasIndex(x => x.CategoryId);

        builder.Property(x => x.HostId).IsRequired();
        builder.HasIndex(x => x.HostId).IsUnique();

        builder.Property(x => x.HostUserName)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(x => x.HostAvatarUrl)
            .HasMaxLength(512);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.CoverImageUrl)
            .HasMaxLength(512);

        builder.Property(x => x.StreamKey)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(x => x.CurrentStreamKey)
            .HasMaxLength(1024);

        builder.Property(x => x.Notice)
            .HasMaxLength(500);

        builder.Property(x => x.Status)
            .HasConversion<int>()
            .IsRequired();
        builder.HasIndex(x => x.Status);

        builder.Property(x => x.CreationTime).IsRequired();
        builder.Property(x => x.UpdationTime);
    }
}
