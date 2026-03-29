using DomainCommons.Models;
namespace DomainCommons;

public interface IRepository<T> where T : IAggregateRoot
{
    IUnitOfWork UnitOfWork { get; }
}