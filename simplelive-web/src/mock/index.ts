import MockAdapter from 'axios-mock-adapter'
import request from '@/api/request'
import { setupRoomMock } from './roomMock'
import { setupUserMock } from './userMock'

export const setupMock = () => {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'

  if (!useMock) {
    console.log('[Real API] 正在连接真实后端网关')
    return
  }

  console.log('[Mock API] 已开启本地 mock 数据')

  const mock = new MockAdapter(request, { delayResponse: 500 })
  setupRoomMock(mock)
  setupUserMock(mock)
}
