import MockAdapter from 'axios-mock-adapter'

export const setupRoomMock = (mock: MockAdapter) => {
  mock.onGet(/\/api\/liverooms\/home.*/).reply(200, [
    {
      Id: '111-222',
      RoomNumber: '10001',
      CategoryId: 1,
      HostUserName: '张三的直播间',
      HostAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      Title: '手把手教你写 React',
      CoverImageUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
      Notice: '欢迎来到直播间',
      Status: 1,
      OnlineCount: 1250,
    },
    {
      Id: '333-444',
      RoomNumber: '10002',
      CategoryId: 2,
      HostUserName: '李四游戏实况',
      HostAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
      Title: '只狼：影逝二度 无伤速通',
      CoverImageUrl:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
      Notice: '点个关注不迷路',
      Status: 1,
      OnlineCount: 8900,
    },
  ])

  mock.onGet(/\/api\/liverooms\/\d+/).reply((config) => {
    const roomNumber = config.url?.split('/').pop() ?? '10001'

    return [
      200,
      {
        Id: '111-222',
        RoomNumber: roomNumber,
        CategoryId: 1,
        HostId: 'host-123',
        HostUserName: '张三的直播间',
        HostAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        Title: '手把手教你写 React',
        CoverImageUrl:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
        Notice: '欢迎来到直播间',
        Status: 1,
        OnlineCount: 1250,
        PlayUrl: 'rtmp://mock-server/live/stream',
      },
    ]
  })

  // 拦截创建直播间请求 (使用正则匹配，兼容末尾是否有斜杠的情况)
  mock.onPost(/\/api\/liverooms\/?$/).reply((config) => {
    // 💡 调试绝招：打印日志，只要能在 F12 控制台看到这句话，就说明 Mock 成功拦截了！
    console.log('🚀 [Mock] 成功拦截到 POST /api/liverooms 创建房间请求');
    console.log('📦 [Mock] 前端发来的表单数据:', config.data);

    // 返回完整的 CreateLiveRoomResponse 契约数据
    return [200, {
      Id: "mock-uuid-1234-5678",
      RoomNumber: "999123",
      StreamKey: "slive_mock_secret_key_888",
      Status: 1 // 1代表Preparing (准备中)
    }];
  });
}
