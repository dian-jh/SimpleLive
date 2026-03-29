namespace EventBusRabbitMQ;

using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Threading;
using EventBusRabbitMQ;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using OpenTelemetry;
using OpenTelemetry.Context.Propagation;
using Polly.Retry;

public sealed class RabbitMQEventBus(
    ILogger<RabbitMQEventBus> logger,
    IServiceProvider serviceProvider,
    IOptions<EventBusOptions> options,
    IOptions<EventBusSubscriptionInfo> subscriptionOptions,
    RabbitMQTelemetry rabbitMQTelemetry) : IEventBus, IDisposable, IHostedService
{
    private const string ExchangeName = "eshop_event_bus";

    private readonly ResiliencePipeline _pipeline = CreateResiliencePipeline(options.Value.RetryCount);
    private readonly TextMapPropagator _propagator = rabbitMQTelemetry.Propagator;
    private readonly ActivitySource _activitySource = rabbitMQTelemetry.ActivitySource;
    private readonly string _queueName = options.Value.SubscriptionClientName;
    private readonly EventBusSubscriptionInfo _subscriptionInfo = subscriptionOptions.Value;
    private IConnection _rabbitMQConnection;

    private IChannel _consumerChannel;

    public async Task PublishAsync(IntegrationEvent @event)
    {
        var routingKey = @event.GetType().Name;

        if (logger.IsEnabled(LogLevel.Trace))
        {
            logger.LogTrace("Creating RabbitMQ channel to publish event: {EventId} ({EventName})", @event.Id, routingKey);
        }

        using var channel = (await _rabbitMQConnection?.CreateChannelAsync()) ?? throw new InvalidOperationException("RabbitMQ connection is not open");

        if (logger.IsEnabled(LogLevel.Trace))
        {
            logger.LogTrace("Declaring RabbitMQ exchange to publish event: {EventId}", @event.Id);
        }

        await channel.ExchangeDeclareAsync(
            exchange: ExchangeName, 
            type: "direct");

        var body = SerializeMessage(@event);

        // Start an activity with a name following the semantic convention of the OpenTelemetry messaging specification.
        // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md
        var activityName = $"{routingKey} publish";

        await _pipeline.Execute(async () =>
        {
            //链路追踪开始，创建一个Activity，记录发出的消息
            using var activity = _activitySource.StartActivity(activityName, ActivityKind.Client);

            // Depending on Sampling (and whether a listener is registered or not), the activity above may not be created.
            // If it is created, then propagate its context. If it is not created, the propagate the Current context, if any.

            ActivityContext contextToInject = default;

            if (activity != null)
            {
                contextToInject = activity.Context;
            }
            else if (Activity.Current != null)
            {
                contextToInject = Activity.Current.Context;
            }
            //设置属性
            var properties = new BasicProperties()
            {
                DeliveryMode = DeliveryModes.Persistent
            };

            static void InjectTraceContextIntoBasicProperties(IBasicProperties props, string key, string value)
            {
                props.Headers ??= new Dictionary<string, object>();
                props.Headers[key] = value;
            }
            //注入追踪上下文，把请求ID给RabbitMQ的Header，这样接收方就知道是谁发的
            _propagator.Inject(new PropagationContext(contextToInject, Baggage.Current), properties, InjectTraceContextIntoBasicProperties);

            SetActivityContext(activity, routingKey, "publish");

            if (logger.IsEnabled(LogLevel.Trace))
            {
                logger.LogTrace("Publishing event to RabbitMQ: {EventId}", @event.Id);
            }

            try
            {
                //真正的发送
                await channel.BasicPublishAsync(
                    exchange: ExchangeName,
                    routingKey: routingKey,
                    mandatory: true,//如果消息没有投递到队列就报错
                    basicProperties: properties,
                    body: body);
            }
            catch (Exception ex)
            {
                activity.SetExceptionTags(ex);

                throw;
            }
        });
    }

    private static void SetActivityContext(Activity activity, string routingKey, string operation)
    {
        if (activity is not null)
        {
            // These tags are added demonstrating the semantic conventions of the OpenTelemetry messaging specification
            // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md
            activity.SetTag("messaging.system", "rabbitmq");
            activity.SetTag("messaging.destination_kind", "queue");
            activity.SetTag("messaging.operation", operation);
            activity.SetTag("messaging.destination.name", routingKey);
            activity.SetTag("messaging.rabbitmq.routing_key", routingKey);
        }
    }

    public void Dispose()
    {
        _consumerChannel?.Dispose();
    }

    private async Task OnMessageReceived(object sender, BasicDeliverEventArgs eventArgs)
    {
        static IEnumerable<string> ExtractTraceContextFromBasicProperties(IReadOnlyBasicProperties props, string key)
        {
            if (props.Headers.TryGetValue(key, out var value))
            {
                var bytes = value as byte[];
                return [Encoding.UTF8.GetString(bytes)];
            }
            return [];
        }
        //提供链路追踪信息。从Header里把发件人的ID拿过来
        // Extract the PropagationContext of the upstream parent from the message headers.
        var parentContext = _propagator.Extract(default, eventArgs.BasicProperties, ExtractTraceContextFromBasicProperties);
        Baggage.Current = parentContext.Baggage;
        //开启接收端的Activity
        // Start an activity with a name following the semantic convention of the OpenTelemetry messaging specification.
        // https://github.com/open-telemetry/semantic-conventions/blob/main/docs/messaging/messaging-spans.md
        var activityName = $"{eventArgs.RoutingKey} receive";

        using var activity = _activitySource.StartActivity(activityName, ActivityKind.Client, parentContext.ActivityContext);

        SetActivityContext(activity, eventArgs.RoutingKey, "receive");

        var eventName = eventArgs.RoutingKey;
        var message = Encoding.UTF8.GetString(eventArgs.Body.Span);
        //核心处理逻辑
        try
        {
            activity?.SetTag("message", message);

            if (message.Contains("throw-fake-exception", StringComparison.InvariantCultureIgnoreCase))
            {
                throw new InvalidOperationException($"Fake exception requested: \"{message}\"");
            }

            await ProcessEvent(eventName, message);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Error Processing message \"{Message}\"", message);

            activity.SetExceptionTags(ex);
        }
        //手动确认
        //如果程序崩溃没执行这一行，消息重回队列，保证消息不丢失
        // Even on exception we take the message off the queue.
        // in a REAL WORLD app this should be handled with a Dead Letter Exchange (DLX). 
        // For more information see: https://www.rabbitmq.com/dlx.html
        await _consumerChannel.BasicAckAsync(eventArgs.DeliveryTag, multiple: false);
    }
    //业务逻辑分发
    private async Task ProcessEvent(string eventName, string message)
    {
        if (logger.IsEnabled(LogLevel.Trace))
        {
            logger.LogTrace("Processing RabbitMQ event: {EventName}", eventName);
        }
        //创建一个DI作用域
        //因为 Handler 通常是 Transient（瞬时的），需要从容器里创建。
        await using var scope = serviceProvider.CreateAsyncScope();
        //根据事件名查找类型
        if (!_subscriptionInfo.EventTypes.TryGetValue(eventName, out var eventType))
        {
            logger.LogWarning("Unable to resolve event type for event name {EventName}", eventName);
            return;
        }   

        // Deserialize the event
        var integrationEvent = DeserializeMessage(message, eventType);

        // REVIEW: This could be done in parallel

        // Get all the handlers using the event type as the key
        //利用KeydeServices找到所有Handler
        //DI 容器会根据 eventType 这个 Key，把你在 AddSubscription 注册的所有 TH 实例拿出来。
        foreach (var handler in scope.ServiceProvider.GetKeyedServices<IIntegrationEventHandler>(eventType))
        {
            await handler.Handle(integrationEvent);
        }
    }

    [UnconditionalSuppressMessage("Trimming", "IL2026:RequiresUnreferencedCode",
        Justification = "The 'JsonSerializer.IsReflectionEnabledByDefault' feature switch, which is set to false by default for trimmed .NET apps, ensures the JsonSerializer doesn't use Reflection.")]
    [UnconditionalSuppressMessage("AOT", "IL3050:RequiresDynamicCode", Justification = "See above.")]
    private IntegrationEvent DeserializeMessage(string message, Type eventType)
    {
        return JsonSerializer.Deserialize(message, eventType, _subscriptionInfo.JsonSerializerOptions) as IntegrationEvent;
    }

    [UnconditionalSuppressMessage("Trimming", "IL2026:RequiresUnreferencedCode",
        Justification = "The 'JsonSerializer.IsReflectionEnabledByDefault' feature switch, which is set to false by default for trimmed .NET apps, ensures the JsonSerializer doesn't use Reflection.")]
    [UnconditionalSuppressMessage("AOT", "IL3050:RequiresDynamicCode", Justification = "See above.")]
    private byte[] SerializeMessage(IntegrationEvent @event)
    {
        return JsonSerializer.SerializeToUtf8Bytes(@event, @event.GetType(), _subscriptionInfo.JsonSerializerOptions);
    }
    //消费者初始化
    public Task StartAsync(CancellationToken cancellationToken)
    {
        //长连接任务，不阻塞主线程
        // Messaging is async so we don't need to wait for it to complete.
        _ = Task.Factory.StartNew(async () =>
        {
            try
            {
                logger.LogInformation("Starting RabbitMQ connection on a background thread");

                _rabbitMQConnection = serviceProvider.GetRequiredService<IConnection>();
                if (!_rabbitMQConnection.IsOpen)
                {
                    return;
                }

                if (logger.IsEnabled(LogLevel.Trace))
                {
                    logger.LogTrace("Creating RabbitMQ consumer channel");
                }

                _consumerChannel = await _rabbitMQConnection.CreateChannelAsync();

                _consumerChannel.CallbackExceptionAsync += (sender, ea) =>
                {
                    logger.LogWarning(ea.Exception, "Error with RabbitMQ consumer channel");
                    return Task.CompletedTask;
                };

                await _consumerChannel.ExchangeDeclareAsync(
                    exchange: ExchangeName,
                    type: "direct");

                await _consumerChannel.QueueDeclareAsync(
                    queue: _queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null);

                if (logger.IsEnabled(LogLevel.Trace))
                {
                    logger.LogTrace("Starting RabbitMQ basic consume");
                }

                var consumer = new AsyncEventingBasicConsumer(_consumerChannel);
                //绑定回调函数：当收到消息的时候，执行OnMessageReceived
                consumer.ReceivedAsync += OnMessageReceived;

                await _consumerChannel.BasicConsumeAsync(
                    queue: _queueName,
                    autoAck: false,
                    consumer: consumer);
                //把之前所有注册过的事件类型，全部都绑定到这个队列上
                foreach (var (eventName, _) in _subscriptionInfo.EventTypes)
                {
                    await _consumerChannel.QueueBindAsync(
                        queue: _queueName,
                        exchange: ExchangeName,
                        routingKey: eventName);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error starting RabbitMQ connection");
            }
        },
        TaskCreationOptions.LongRunning);

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
    //弹性重试配置
    private static ResiliencePipeline CreateResiliencePipeline(int retryCount)
    {
        // See https://www.pollydocs.org/strategies/retry.html
        var retryOptions = new RetryStrategyOptions
        {
            ShouldHandle = new PredicateBuilder().Handle<BrokerUnreachableException>().Handle<SocketException>(),
            MaxRetryAttempts = retryCount,
            DelayGenerator = (context) => ValueTask.FromResult(GenerateDelay(context.AttemptNumber))
        };

        return new ResiliencePipelineBuilder()
            .AddRetry(retryOptions)
            .Build();

        static TimeSpan? GenerateDelay(int attempt)
        {
            //指数重试：2、4、8
            return TimeSpan.FromSeconds(Math.Pow(2, attempt));
        }
    }
}
