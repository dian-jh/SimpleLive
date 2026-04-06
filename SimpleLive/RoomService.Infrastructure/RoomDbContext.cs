using MediatR;
using Microsoft.EntityFrameworkCore;
using RoomService.Domain.Entities;
using ZD.DomainCommons;
using ZD.IntegrationEventLogEF;

namespace RoomService.Infrastructure;

public sealed class RoomDbContext : DbContext, IUnitOfWork
{
    private readonly IMediator _mediator;

    public RoomDbContext(DbContextOptions<RoomDbContext> options, IMediator mediator) : base(options)
    {
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
    }

    public DbSet<LiveRoom> LiveRooms => Set<LiveRoom>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RoomDbContext).Assembly);
        modelBuilder.UseIntegrationEventLogs();
    }

    public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        await _mediator.DispatchDomainEventsAsync(this);
        _ = await base.SaveChangesAsync(cancellationToken);
        return true;
    }
}
