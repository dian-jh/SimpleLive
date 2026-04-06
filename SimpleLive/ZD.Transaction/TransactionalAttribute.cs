

namespace ZD.Transaction;

/// <summary>
/// 标记该接口需要开启数据库事务，并在事务成功提交后发布发件箱事件
/// </summary>
// AttributeUsage 规定了这个特性只能贴在方法上（不能贴在类或属性上），并且一个方法只能贴一次
[AttributeUsage(AttributeTargets.Method, Inherited = true, AllowMultiple = false)]
public class TransactionalAttribute : Attribute
{
}