# SimpleLive

使用React+Typescript技术栈

核心文件夹：

```
src/
├── api/             # [网络层] 所有与后端微服务/API网关交互的请求
├── store/           # [状态层] 全局状态（如当前登录用户、全局配置）
├── hooks/           # [逻辑层] 抽离出来的通用交互逻辑和SignalR连接逻辑
├── components/      # [公共 UI 层] 全局通用的纯组件（如按钮、弹幕框，Shadcn生成的代码放这）
├── features/        # [业务功能层] 核心模块！按业务划分（如直播间、个人中心）
├── pages/           # [页面容器层] 路由直接指向的文件，负责组装 feature
├── router/          # [路由层] 路由配置文件
├── utils/           # [工具层] 纯函数工具（如时间格式化、本地存储封装）
├── types/           # [类型层] TypeScript 接口定义（与后端DTO对应）
└── App.tsx          # 根组件
```

## API

- **`src/api/request.ts`**: 这里配置 Axios 实例。你可以在这里配置统一的 `BaseURL`（指向你的 YARP API 网关地址），并在此处统一处理 JWT Token 携带、401 状态码拦截跳转等逻辑。