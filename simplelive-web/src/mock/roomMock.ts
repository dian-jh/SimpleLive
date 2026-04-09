import MockAdapter from 'axios-mock-adapter';

export const setupRoomMock = (mock: MockAdapter) => {
    // 1. Mock 获取直播大厅列表接口 (对应 GET /api/liverooms/home)
    // 使用正则表达式匹配，因为可能会带有 ?pageIndex=1 参数
    mock.onGet(/\/api\/liverooms\/home.*/).reply(200, [
        {
            Id: "111-222",
            RoomNumber: "10001",
            CategoryId: 1,
            HostUserName: "张三的直播间",
            HostAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            Title: "手把手教你写 React",
            CoverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80",
            Notice: "欢迎来到直播间",
            Status: 1,
            OnlineCount: 1250
        },
        {
            Id: "333-444",
            RoomNumber: "10002",
            CategoryId: 2,
            HostUserName: "李四游戏实况",
            HostAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
            Title: "只狼：影逝二度 无伤速通",
            CoverImageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80",
            Notice: "点个关注不迷路",
            Status: 1,
            OnlineCount: 8900
        }
    ]);

    // 2. Mock 获取直播间详情接口 (对应 GET /api/liverooms/{roomNumber})
    // 必须放在 home 后面，防止路由冲突
    mock.onGet(/\/api\/liverooms\/\d+/).reply((config) => {
        // 你甚至可以在这里写逻辑，根据 URL 里的 roomNumber 返回不同的数据
        const roomNumber = config.url?.split('/').pop();

        return [200, {
            Id: "111-222",
            RoomNumber: roomNumber,
            CategoryId: 1,
            HostId: "host-123",
            HostUserName: "张三的直播间",
            HostAvatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            Title: "手把手教你写 React",
            CoverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80",
            Notice: "欢迎来到直播间",
            Status: 1,
            OnlineCount: 1250,
            PlayUrl: "rtmp://mock-server/live/stream" // 假的播放地址
        }];
    });
};