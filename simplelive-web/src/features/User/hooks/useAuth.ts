import { useState } from 'react'
import {
  loginApi,
  registerApi,
  type LoginRequestDto,
  type RegisterRequestDto,
} from '@/api/User/authApi'
import { useUserStore } from '@/store/User/useUserStore'

const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '请求失败，请稍后重试'
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const setToken = useUserStore((state) => state.setToken)

  // 教学点：前端用 useState 管 isLoading，本质是“UI 状态开关”。
  // 浏览器 JS 在单线程事件循环里运行，它不是后端那种多线程并发模型，
  // 所以这里不是线程锁，而是阻止用户重复点击导致重复请求。
  const login = async (payload: LoginRequestDto): Promise<boolean> => {
    if (isLoading) {
      return false
    }

    setIsLoading(true)
    try {
      const data = await loginApi(payload)
      setToken(data.token)
      alert('登录成功')
      return true
    } catch (error) {
      console.error("Axios 捕获到的真实错误:", error);
      alert(parseErrorMessage(error))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload: RegisterRequestDto): Promise<boolean> => {
    if (isLoading) {
      return false
    }

    setIsLoading(true)
    try {
      await registerApi(payload)
      alert('注册成功，请登录')
      return true
    } catch (error) {
      alert(parseErrorMessage(error))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    login,
    register,
  }
}
