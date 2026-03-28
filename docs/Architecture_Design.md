# 简播(SimpleLive)系统架构设计文档

## 概述与背景

随着直播需求的轻量化，本项目旨在构建一个 Web 端简易开播平台（简播 V1.0）。 本文档旨在确立简播 V1.0 后端系统的整体架构、微服务划分、核心流转机制及数据存储方案。系统将采用基于 .NET 生态的微服务架构，参考微软 eShop 经典架构模式，以确保系统具备良好的可扩展性、高可用性和清晰的业务边界。

### 核心设计目标

**业务支撑：**用户、直播间、弹幕互动、第三方推流等核心功能

**高内聚低耦合：**采用DDD思想划分微服务，通过异步事件总线(EventBus)实现集成事件，达成解耦的目的

**高并发互动支撑：**针对弹幕等高频写入场景，提供平滑的接入层与消息分发机制

**现代化云原生编排：**利用.NET Aspire统一管理依赖资源(Redis,DB,RabbitMQ)与服务编排，提升本地开发与诊断体验

## 总体架构设计

系统采用经典的API网关+后端微服务+异步事件总线的架构

### 系统架构图

![](Images/AD/1.png)

```
graph LR
    %% 客户端层
    Client[浏览器/观众/主播] -->|HTTP/WebSocket| YARP[YARP API Gateway]
    OBS[OBS等推流工具] -->|RTMP推流| MediaServer[流媒体服务器SRS/ZLM]
    
    %% 网关路由
    YARP -->|/api/user| UserAPI(Identity.API)
    YARP -->|/api/room| RoomAPI(LiveRoom.API)
    YARP -->|/hub/chat| ChatAPI(Interaction.API)
    
    %% 服务间异步通信
    RoomAPI -.->|Publish Event| EventBus((EventBus RabbitMQ))
    ChatAPI -.->|Subscribe| EventBus
    
    %% 流媒体回调
    MediaServer -->|Webhook Callback| RoomAPI
    
    %% 基础设施层
    UserAPI --> PG_User[(PostgreSQL: User)]
    RoomAPI --> PG_Room[(PostgreSQL: Room)]
    RoomAPI --> Redis_Room[(Redis: RoomState)]
```

### 核心技术选型与推演

#### API网关：YARP

- **为什么不用客户端直连微服务?**微服务架构下，后端被拆成多个API。如果不加网关，前端需要维护多个基地址，且跨域(CORS)、鉴权、限流等横切关注点需要在每个微服务里重复写一遍
- **为什么选YARP？**它是微软官方出品的高度可定制的反向代理，完美契合 .NET Core 中间件管道。相比于 Nginx，YARP 允许我们直接用 C# 代码编写路由规则、动态负载均衡，并能轻松与 Identity 服务集成做统一鉴权

#### 服务编排与诊断：.NET Aspire

- **为什么使用Aspire？**如果微服务一多，本地启动要拉多个控制台、Docker容器。Aspire充当了AppHost，一键拉起所有 .NET 服务以及依赖的 Redis、RabbitMQ、PostgreSQL 容器。更重要的是，它开箱即用了 OpenTelemetry（链路追踪），方便我们排查“网关 -> 房间服务 -> 事件总线 -> 互动服务”这条长链路到底卡在哪里

#### 微服务间解耦：EventBus(RabbitMQ)

- **为什么不用 HTTP 互调？** 一个微服务直接调用另一个微服务，若那个微服务宕机，会导致本微服务也宕机，从而导致**服务雪崩效应**，这是不合理的强耦合

- **设计方案：**引入 EventBus 集成事件（Integration Events）。这保证了核心链路的高可用

#### 实时通信：SignalR

- **为什么选 SignalR？** 弹幕和聊天属于双向高频通信。SignalR 是 .NET 下最成熟的方案，它自动协商 WebSocket、Server-Sent Events 或 Long Polling，并且支持横向扩展（搭配 Redis Backplane）

## DDD界限上下文划分

| 界限上下文(微服务)               | 核心职责                                                     | 独占数据存储         |
| -------------------------------- | ------------------------------------------------------------ | -------------------- |
| **User.API** (用户上下文)        | 注册、登录、JWT 颁发、个人基础信息维护                       | userdb(PGSQL)        |
| **LiveRoom.API** (直播间上下文)  | 房间创建、开播/关播状态流转、推流凭证校验（Webhook 接收）、直播列表 | roomdb (PG) + Redis  |
| **Interaction.API** (互动上下文) | 建立 WebSocket 连接、弹幕广播、实时在线人数统计              | Redis (暂不需持久化) |

**架构约束：**任何微服务严禁直接连接其他微服务的数据库。必须通过 API 或 EventBus 进行数据交互



## 核心业务流转设计

### 第三方推流与状态流转

```
sequenceDiagram
    autonumber
    participant OBS
    participant MS as 媒体服务器 (SRS)
    participant LR as LiveRoom.API
    participant EB as EventBus
    participant Chat as Interaction.API

    OBS->>MS: 发起 RTMP 推流 (附带推流码)
    MS->>LR: 异步 Webhook (on_publish)
    LR->>LR: 校验推流码是否合法
    alt 凭证无效
        LR-->>MS: 拒绝接入 (HTTP 401/403)
        MS-->>OBS: 断开连接
    else 凭证有效
        LR->>LR: 更新数据库 & Redis (状态设为 Live)
        LR-->>MS: 允许接入 (HTTP 200)
        MS->>OBS: 开始接收推流
        LR->>EB: 发布 LiveRoomStartedIntegrationEvent
        EB->>Chat: 接收开播事件
        Chat->>Chat: 初始化直播间聊天频道
    end
```

**设计关键点说明：**

- 媒体服务器（如 SRS）属于 C/C++ 领域，性能极高，负责处理沉重的视频流。

- 我们的 C# 业务后端 **绝对不碰视频流**，只处理信令与回调（Webhook）。

- 防网络抖动设计：针对 PRD 提到的“断开连接超过 30 秒才判定关播”，可以在 LiveRoom.API 内部引入延迟队列机制（如 Hangfire 或 RabbitMQ 的延迟死信队列），收到 `on_unpublish` 后不立刻关播，而是发送一个 30s 的延迟任务，如果 30s 内又收到了 `on_publish`，则取消关播动作。

## 数据与并发设计

**直播列表获取削峰：**用户打开首页请求直播列表，直接查 PostgreSQL 会导致数据库连接池被打满

- **策略：**LiveRoom.API 在更新房间状态时，同步维护一份数据在 Redis 中（如 SortedSet，以观众人数排序）。首页 API 直接从 Redis 读取返回

**在线人数统计：**

- **策略：**客户端建立 SignalR 连接时，Interaction.API 在 Redis 中对该房间的在线人数执行 `INCR` 操作；断开连接执行 `DECR` 操作。房间热度无需精确到个位，前端可设置 5-10 秒定时拉取一次



## 内部结构与领域模型

各个微服务采用严格的分层架构，以"LiveRoom"为例，包含以下工程：

* **LiveRoom.Domain:**核心业务模型层，包含'Room'聚合根，无任何外部框架依赖
* **LiveRoom.Infrastructure：**应用逻辑与基础设施层
* **LiveRoom.API:**提供HTTP/REST端点并集成Aspire监控

```
实体放到entities文件夹下：
Domain
	entities
		实体
	IxxRepository
	xxDomainService
Infrastructure
	Configs
		EF实体配置
	Service(文件夹)(将一些蕴含复杂逻辑的代码放到这里面)
	xxRepository(继承IxxRepository)	
	xxDbContext
API
	Controllers
		Request
			请求实体xxx
		Response
			响应实体xxx
		xxController
		Events(文件夹)

将一些微服务公用的放到文件夹Common下，在Common下创建公共模块。例如：EventBus等等
项目总体文件夹目录结构为：
解决方案文件夹：
Solutions Items
src
	Commons(文件夹)
		EventBus(模块)
	LiveRoom(文件夹)
		LiveRoom.Domain
		LiveRoom.Infrastructure
		LiveRoom.API
	User(文件夹)
		User.Domain
		User.Infrastructure
		User.API
	Interaction(文件夹)
		Interaction.Domain
		Interaction.Infrastructure
		Interaction.API
tests


核心聚合根设计(充血模型)
例：Room
Id
HostId
Title
StreamKey
RoomStatus		[Enum: Offline, PreParing, Live, Ended]
LastHeartbeat	[DateTime]
void EndLive()
void ResetStreamKey()等等方法
```

内部结构大体上上上面这样的结构，看情况增加Extensions文件夹和Exceptions文件夹或者Event文件夹(创建DomainEvent领域事件、IntegrationEvent集成事件)

