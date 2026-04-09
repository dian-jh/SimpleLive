import MockAdapter from 'axios-mock-adapter';
import request from '@/api/request'; // 引入你之前写好的 axios 全局实例
import { setupRoomMock } from './roomMock';

export const setupMock = () => {
    // 读取环境变量
    const useMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (useMock) {
        console.log('🚀 [Mock API] 已开启本地数据模拟');

        // 将 mock 适配器挂载到你的全局 axios 实例上
        // delayResponse: 500 表示模拟 500ms 的网络延迟，让你能看到 Loading 骨架屏！
        const mock = new MockAdapter(request, { delayResponse: 500 });

        // 注册各个领域的 mock
        setupRoomMock(mock);
        // 如果以后有 userMock，就在这里继续加：setupUserMock(mock);
    } else {
        console.log('🔗 [Real API] 正在连接真实的后端网关');
    }
};