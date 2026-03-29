namespace ZD.EventBus.Extensions;
/// <summary>
/// 将编译器内部名称转换成人类能读懂的格式。例如：List1`->List<int>
/// </summary>
public static class GenericTypeExtensions
{
    public static string GetGenericTypeName(this Type type)
    {
        string typeName;

        if (type.IsGenericType)
        {
            //GetGenericArguments:获取所有泛型类型，例如List<int>就拿到int
            var genericTypes = string.Join(",", type.GetGenericArguments().Select(t => t.Name).ToArray());
            //编译器在生成IL语言的时候，会给泛型类重命名为：原始类名 + ` + 泛型参数的个数
            //这里的作用例如：List<int,string>:List`2 -> List<int,string>
            typeName = $"{type.Name.Remove(type.Name.IndexOf('`'))}<{genericTypes}>";
        }
        else
        {
            typeName = type.Name;
        }

        return typeName;
    }

    public static string GetGenericTypeName(this object @object)
    {
        return @object.GetType().GetGenericTypeName();
    }
}
