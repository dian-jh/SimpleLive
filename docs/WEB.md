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







## AI提示词

```
角色与背景设定
你是一位拥有十年经验的前端架构师，精通 React 18、TypeScript、Vite、Tailwind CSS、Zustand 和 Framer Motion。
我现在是一名拥有 C# .NET 后端经验但前端刚起步的 CS 专业学生。请严格按照企业级标准为我生成代码，并以教学的态度在关键代码处写下中文注释，解释“为什么这么写”（尤其是对比后端架构思维）。

# 核心架构规范 (必须严格遵守，违者重写)
1. **单文件行数限制**：任何 `.tsx` 或 `.ts` 文件绝对不能超过 300 行。
2. **职责极度分离**：UI 纯展示、逻辑抽离到 Hooks、状态存入 Store、请求归拢到 API。
3. **领域驱动目录**：按照功能模块划分目录结构，当前领域为 `User`。
4. **DRY 原则 (Don't Repeat Yourself)**：严禁在多个组件中复制粘贴冗长的 Tailwind 类名。遇到相同的输入框、按钮，**必须**抽离为公共的小组件（如 `AuthInput`, `AuthButton`）。
5. **动效优先**：UI 交互必须保留高级感，页面内的状态切换尽量使用 `framer-motion` 进行平滑过渡，拒绝生硬的 DOM 替换或不必要的路由硬跳转。

# 任务目标
根据下方提供的 C# 后端接口契约，为我的项目重构/生成【用户登录与注册模块】的前端代码。
注意：项目中已经存在全局的 axios 实例 `src/api/request.ts`，请直接引入它进行请求。

# 后端接口契约 (C#)
基础 API 路径前缀: `/api/Auth`

1. 注册接口
- POST `/api/Auth/register`
- Request DTO: `{ UserName?: string, Email?: string, Password: string }`
- Response: 成功 200 OK，失败 400 (Body: `{ Message: string }`)

2. 登录接口
- POST `/api/Auth/login`
- Request DTO: `{ Account: string, Password: string }` 
- Response: 成功 200 OK (Body: `{ Token: string }`)，失败 401 (Body: `{ Message: string }`)

# 需要生成的文件及要求 (请依次输出)

1.【API层】 `src/api/User/authApi.ts`
- 引入 `@/api/request`。定义严谨的 TS Interface。导出 `loginApi` 和 `registerApi`。

2.【Store层】 `src/store/User/useUserStore.ts`
- 使用 Zustand 创建全局状态存储 `token`，并使用 `persist` 中间件持久化到 localStorage。

3.【Hooks层】 `src/features/User/hooks/useAuth.ts`
- 封装登录和注册逻辑。维护 `isLoading` 状态防抖。捕获异常并处理。登录成功后存入 Store。

4.【UI原子组件层】 `src/features/User/components/AuthInput.tsx` & `AuthButton.tsx`
- **新增要求**：将带有冗长 Tailwind 样式的 `<input>` 和 `<button>` 封装成这两个原子组件，暴露 `value`, `onChange`, `icon`, `isLoading` 等 props，彻底消除重复代码。

5.【UI业务组件层】 `src/features/User/components/LoginForm.tsx` & `RegisterForm.tsx`
- 纯 UI 组件，内部组合调用上方定义的 `AuthInput` 和 `AuthButton`。

6.【页面容器层】 `src/pages/User/AuthPage.tsx`
- **核心交互要求**：废弃多路由设计。在组件内维护 `mode: 'login' | 'register'` 状态。
- 引入 `framer-motion`，使用 `<AnimatePresence mode="wait">` 包裹两个表单组件。当 `mode` 切换时，实现登录表单向左滑出、注册表单向右滑入的平滑过渡动画。

# 教学附加要求
请在代码注释中，向我解释：
1. Zustand 持久化的原理是什么？
2. 为什么要专门抽离 `AuthInput`？如果放在 C# 里这相当于什么设计模式？
3. `framer-motion` 的 `AnimatePresence` 是如何让已经被 React 卸载的组件播放完动画再消失的？


完成情况：
6 个目标文件

authApi.ts
useUserStore.ts
useAuth.ts
LoginForm.tsx
RegisterForm.tsx
AuthPage.tsx
为保证“完美协同”补充的工程改动

配置 @ 别名：
tsconfig.app.json, vite.config.ts
安装依赖：zustand、tailwindcss、@tailwindcss/vite（已更新 package.json/package-lock.json）
接入 Tailwind 入口样式：
index.css
入口页指向认证页面：
App.tsx
教学注释已写入

useAuth.ts：useState(isLoading) 与后端线程模型区别
useUserStore.ts：Zustand persist 持久化原理
authApi.ts：Axios/TS 泛型如何约束请求与响应类型安全
验证结果

npx tsc -b 通过
npm run build 通过（Vite 生产构建成功）
已按你的原型要求完成改造：现在是两个独立页面（登录页、注册页），不再是同页切换，并且样式细节已贴近 yx2.png / yx3.png 与 docs/yxcode 的认证原型。

本次改动

路由拆分为独立页：
router/index.tsx
路径：/login、/register，/ 自动跳转到 /login
登录页与注册页容器：
LoginPage.tsx
RegisterPage.tsx
统一认证外壳（背景、水印、卡片）：
AuthLayout.tsx
按原型重做表单 UI 与交互：
LoginForm.tsx
RegisterForm.tsx
AuthIcons.tsx
应用入口改为路由：
App.tsx
删除旧的同页模式文件：
src/pages/User/AuthPage.tsx（已删除）
交互对齐点

登录页：账号输入、密码显隐、记住登录、忘记密码位、底部“立即注册”跳转。
注册页：账号输入、两次密码显隐、前端校验提示、底部“登录”跳转。
视觉：浅灰背景、大号 S live 水印、半透明圆角卡片、输入框与深色主按钮风格均按原型方向收敛。
验证结果

npx tsc -b 通过
npm run build 通过（生产构建成功）
```

```
# 极端代码精简原则 (Extreme DRY & Minification)
在接下来的代码生成/重构中，你必须将“消除冗余代码”作为最高优先级之一。请严格执行以下“瘦身”策略：

1. **绝对不留死代码 (No Dead Code)**：
   - 重构时，被替代的旧逻辑、旧 UI 必须被彻底删除。
   - 严禁在代码中留下 `// 这里是以前的代码` 或被注释掉的大段逻辑。

2. **数据驱动 UI (Map over Data)**：
   - 如果遇到 3 个以上高度相似的 UI 结构（例如侧边栏菜单、多个相似的表单输入框、直播间列表），**严禁复制粘贴 JSX 标签**。
   - 必须在组件顶部定义一个配置数组（如 `const FORM_FIELDS = [...]`），然后在 JSX 中使用 `Array.map()` 循环渲染。

3. **极致抽象 (Aggressive Abstraction)**：
   - 当检测到超过 3 个相同 Tailwind 类名的组合时，必须将其提取为 `const` 字符串变量或独立的 UI 原子组件。
   - 提取组件时，尽可能继承原生的 HTML 属性泛型（如 `extends InputHTMLAttributes<HTMLInputElement>`），避免在 Props 中重复声明。

4. **强制自检报告 (Mandatory Diff Report)**：
   在输出完代码后，你必须用一段话向我汇报：
   - “我通过提取 XX 组件，精简了 XX 行重复代码。”
   - “我删除了哪些不再使用的废弃逻辑/导入。”
   - 如果行数增加了，必须向我解释增量去哪了（例如：是因为增加了必需的 TypeScript 类型约束）。
```



直播模块

```
# 角色与背景设定
你是一位拥有十年经验的前端架构师，精通 React 18、TypeScript、Vite、Tailwind CSS、Zustand 和 Framer Motion。
我现在是一名拥有 C# .NET 后端经验但前端刚起步的 CS 专业学生。请严格按照企业级标准为我生成代码，并以教学的态度在关键代码处写下中文注释，解释“为什么这么写”（尤其是对比后端架构思维）。

# 核心架构规范 (必须严格遵守，违者重写)
1. **单文件行数限制**：任何 `.tsx` 或 `.ts` 文件绝对不能超过 300 行。
2. **职责极度分离**：UI 纯展示、逻辑抽离到 Hooks、状态存入 Store、请求归拢到 API。
3. **领域驱动目录**：按照功能模块划分目录结构，当前领域为 `Live`。
4. **动效优先**：页面进入、列表加载、弹幕弹出必须保留高级感，使用 `framer-motion` 进行平滑过渡。

# 极端代码精简原则 (Extreme DRY & Minification)
1. **绝对不留死代码**：重构或新建时，严禁留下被注释掉的大段逻辑。
2. **数据驱动 UI**：遇到 3 个以上高度相似的 UI 结构（如直播间列表、多条弹幕），**严禁复制粘贴 JSX**。必须使用 `Array.map()` 循环渲染，并加上正确的 `key`。
3. **极致抽象**：高度复用的 UI（如直播卡片、统一按钮）必须提取为独立的小组件。
4. **强制自检报告**：输出完代码后，必须汇报你提取了哪些组件、精简了哪些结构。

# 任务目标
根据下方提供的真实的 C# 后端接口与 SignalR 契约，为我的“简播”项目生成【直播大厅与直播间模块】的前端代码。
注意：项目中已有全局 axios 实例 `src/api/request.ts` 和状态管理 `src/store/User/useUserStore.ts`。

# 后端接口契约 (C# 真实约束)

**1. HTTP API 契约**
基础路径: `/api/liverooms`
- 获取直播大厅列表: `GET /api/liverooms/home?pageIndex=1&pageSize=20`
  - 返回: `Array<{ Id, RoomNumber, CategoryId, HostUserName, HostAvatarUrl, Title, CoverImageUrl, Notice, Status, OnlineCount }>`
- 获取直播间详情: `GET /api/liverooms/{roomNumber}`
  - 返回: `{ Id, RoomNumber, CategoryId, HostId, HostUserName, HostAvatarUrl, Title, CoverImageUrl, Notice, Status, OnlineCount, PlayUrl }` (注意 PlayUrl 是 .flv 格式)

**2. SignalR 契约**
- Hub 路径: `/hubs/liveroom`
- 鉴权: 必须在 `withUrl` 配置中通过 `accessTokenFactory` 传入本地 Zustand 中的 JWT Token。
- 前端需调用的服务器方法: `JoinRoom(string roomNumber)`, `LeaveRoom()`
- 前端需监听的服务器事件: `"OnViewerCountChanged"` (接收参数为 `int onlineCount`)

# 需要生成的文件及要求 (请依次输出)

1.【API层】 `src/api/Live/roomApi.ts`
- 引入 `@/api/request`。严格定义 TS Interface 对应上述 C# DTO。导出获取列表和详情的异步函数。

2.【UI原子组件层】 `src/features/Live/components/StreamCard.tsx`
- 纯 UI 组件，用于首页瀑布流。包含封面图、标题、主播名、当前热度(在线人数)。
- 使用 `framer-motion` 实现鼠标悬浮时卡片轻微上浮的物理动效。

3.【Hooks层】 `src/features/Live/hooks/useRoomList.ts`
- 封装获取大厅列表逻辑，管理 `rooms` 和 `isLoading` 状态。

4.【Hooks层】 `src/features/Live/hooks/useLiveRoom.ts` (极其重要)
- 接收 `roomNumber` 参数。
- **职责一：** 调用 API 获取房间详情信息（包括 FLV 播放地址）。
- **职责二：** 使用 `@microsoft/signalr` 建立长连接。使用 `accessTokenFactory` 携带 Token。
- **职责三：** 连接成功后调用 `JoinRoom`，并监听 `OnViewerCountChanged` 更新内部的 `onlineCount` 状态。
- **灾难防范：** 必须在 `useEffect` 的 cleanup 函数（`return () => {...}`）中调用 `LeaveRoom` 并断开 SignalR 连接，防止 React 重新渲染导致连接泄露。

5.【UI业务组件层】 `src/features/Live/components/VideoPlayer.tsx` & `ChatPanel.tsx`
- `VideoPlayer`: 接收 `PlayUrl`。目前先用深色背景居中显示“FLV流播放占位”进行模拟。
- `ChatPanel`: 接收 `onlineCount` 显示在线人数。下方放置弹幕聊天流和发送输入框（样式要求现代、极简）。

6.【页面容器层】 `src/pages/Live/HomePage.tsx`
- 使用 Tailwind Grid 布局（如 `grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6`）循环渲染 `StreamCard`。
- 加入整体页面的淡入动效。

7.【页面容器层】 `src/pages/Live/LiveRoomPage.tsx`
- 通过 `useParams` 获取 URL 中的 `roomNumber`，调用 `useLiveRoom`。
- 采用左右分栏的现代直播间布局（左侧视频区占主要空间，右侧弹幕面板固定宽度 320px 左右）。

# 教学附加要求
请在代码注释中，向我解释：
1. 为什么 SignalR 的 Token 要放在 `accessTokenFactory` 里传，而不是像 Axios 一样放在全局 Header 里？这和 WebSocket 协议有什么关系？
2. `useLiveRoom.ts` 里的 cleanup 函数是如何保证我们在切换路由时，后端不会认为我们还在房间里挂机刷在线人数的？
```

