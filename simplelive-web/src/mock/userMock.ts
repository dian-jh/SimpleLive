import MockAdapter from 'axios-mock-adapter'

const MOCK_PROFILE_WITH_AVATAR = {
  AvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SimpleLiveUser',
  NickName: '直播观众',
  Age: 26,
  Gender: 0,
  Location: '上海',
  Signature: '今天也要开心看直播',
  FollowingCount: 21,
  FollowerCount: 8,
}

const MOCK_PROFILE_NO_AVATAR = {
  ...MOCK_PROFILE_WITH_AVATAR,
  AvatarUrl: null,
}

const resolveAuthorizationHeader = (headers: unknown): string => {
  if (!headers || typeof headers !== 'object') {
    return ''
  }

  const headerMap = headers as Record<string, unknown>
  const authHeader = headerMap.Authorization ?? headerMap.authorization
  return typeof authHeader === 'string' ? authHeader : ''
}

export const setupUserMock = (mock: MockAdapter) => {
  mock.onPost('/api/Auth/login').reply((config) => {
    const { Account, Password } = JSON.parse(config.data)

    if (Password !== '123456') {
      return [401, { Message: '密码错误，测试环境请使用密码 123456' }]
    }

    const token =
      typeof Account === 'string' && Account.includes('noavatar')
        ? 'mock-jwt-token-no-avatar'
        : 'mock-jwt-token-simplelive-888'

    return [200, { Token: token }]
  })

  mock.onPost('/api/Auth/register').reply(200, {})

  mock.onGet('/api/UserProfile/me').reply((config) => {
    const authorization = resolveAuthorizationHeader(config.headers)

    if (!authorization.startsWith('Bearer ')) {
      return [401, { Message: '未授权或 Token 缺失' }]
    }

    const token = authorization.replace('Bearer ', '').trim()
    const profile =
      token === 'mock-jwt-token-no-avatar'
        ? MOCK_PROFILE_NO_AVATAR
        : MOCK_PROFILE_WITH_AVATAR

    return [200, profile]
  })
}
