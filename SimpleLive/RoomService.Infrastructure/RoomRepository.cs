using Microsoft.EntityFrameworkCore;
using RoomService.Domain;
using RoomService.Domain.Entities;
using RoomService.Domain.Enums;
using ZD.DomainCommons;

namespace RoomService.Infrastructure;

public sealed class RoomRepository : IRoomRepository
{
    private readonly RoomDbContext _dbContext;

    public RoomRepository(RoomDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IUnitOfWork UnitOfWork => _dbContext;

    public LiveRoom Add(LiveRoom room)
    {
        return _dbContext.LiveRooms.Add(room).Entity;
    }

    public LiveRoom Update(LiveRoom room)
    {
        return _dbContext.LiveRooms.Update(room).Entity;
    }

    public async Task<LiveRoom?> FindByIdAsync(Guid roomId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.LiveRooms.FirstOrDefaultAsync(x => x.Id == roomId, cancellationToken);
    }

    public async Task<LiveRoom?> FindByRoomNumberAsync(string roomNumber, CancellationToken cancellationToken = default)
    {
        return await _dbContext.LiveRooms.FirstOrDefaultAsync(x => x.RoomNumber == roomNumber, cancellationToken);
    }

    public async Task<LiveRoom?> FindByHostIdAsync(Guid hostId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.LiveRooms.FirstOrDefaultAsync(x => x.HostId == hostId, cancellationToken);
    }

    public async Task<IReadOnlyList<LiveRoom>> GetByHostIdAsync(Guid hostId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.LiveRooms.Where(x => x.HostId == hostId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LiveRoom>> GetByStatusAsync(
        LiveRoomStatus status,
        int? categoryId,
        int pageIndex,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        pageIndex = pageIndex <= 0 ? 1 : pageIndex;
        pageSize = pageSize <= 0 ? 20 : pageSize;

        var query = _dbContext.LiveRooms
            .AsNoTracking()
            .Where(x => x.Status == status);

        if (categoryId.HasValue && categoryId != null)
        {
            query = query.Where(x => x.CategoryId == categoryId.Value);
        }

        return await query
            .OrderByDescending(x => x.CreationTime)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<string>> GetRoomNumbersByStatusAsync(
        LiveRoomStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.LiveRooms
            .AsNoTracking()
            .Where(x => x.Status == status)
            .Select(x => x.RoomNumber)
            .ToListAsync(cancellationToken);
    }
}
