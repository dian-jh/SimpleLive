using ZD.DomainCommons.Models;
namespace ZD.DomainCommons;

public interface IRepository<T> where T : IAggregateRoot
{
    IUnitOfWork UnitOfWork { get; }
}