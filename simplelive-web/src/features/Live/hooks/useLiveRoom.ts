import { useEffect, useState } from 'react'
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import request from '@/api/request'
import { getLiveRoomDetail, type LiveRoomDetailDto } from '@/api/Live/roomApi'
import { useUserStore } from '@/store/User/useUserStore'

const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '进入直播间失败，请稍后重试'
}

const buildHubUrl = (): string => {
  const backendBaseUrl = request.defaults.baseURL ?? window.location.origin
  return new URL('/hubs/liveroom', backendBaseUrl).toString()
}

export const useLiveRoom = (roomNumber?: string) => {
  const [roomDetail, setRoomDetail] = useState<LiveRoomDetailDto | null>(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomNumber) {
      setRoomDetail(null)
      setOnlineCount(0)
      setError(null)
      return
    }

    let isDisposed = false

    // 这里不要把 useEffect 回调直接写成 async。
    // async effect 会返回 Promise，和 C# 的 async void 一样，调用方难以可靠等待与捕获异常。
    const loadRoomDetail = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const detail = await getLiveRoomDetail(roomNumber)
        if (isDisposed) {
          return
        }

        setRoomDetail(detail)
        setOnlineCount(detail.onlineCount ?? 0)
      } catch (requestError) {
        if (!isDisposed) {
          setError(parseErrorMessage(requestError))
        }
      } finally {
        if (!isDisposed) {
          setIsLoading(false)
        }
      }
    }

    void loadRoomDetail()

    return () => {
      isDisposed = true
    }
  }, [roomNumber])

  useEffect(() => {
    if (!roomNumber) {
      return
    }

    let isDisposed = false
    const connection = new HubConnectionBuilder()
      .withUrl(buildHubUrl(), {
        // SignalR 的握手是独立连接链路，不会经过 axios 拦截器。
        // 所以 token 必须放在 accessTokenFactory 中。
        accessTokenFactory: () => {
          // 1. 读取当前内存中的 token 状态
          const tokenData = useUserStore.getState().token;

          if (!tokenData) return '';

          // 2. 兼容对象和字符串的情况（与 axios 拦截器保持绝对一致）
          const actualToken = typeof tokenData === 'string'
            ? tokenData
            : (tokenData as any).accessToken;

          // 3. 返回真实的 JWT 字符串
          return actualToken ?? '';
        },
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    const handleViewerCountChanged = (nextOnlineCount: number) => {
      setOnlineCount(nextOnlineCount)
    }

    connection.on('OnViewerCountChanged', handleViewerCountChanged)

    const connect = async () => {
      setIsConnecting(true)

      try {
        await connection.start()
        if (isDisposed) {
          return
        }

        await connection.invoke('JoinRoom', roomNumber)
      } catch (connectError) {
        if (!isDisposed) {
          setError(parseErrorMessage(connectError))
        }
      } finally {
        if (!isDisposed) {
          setIsConnecting(false)
        }
      }
    }

    void connect()

    return () => {
      isDisposed = true
      connection.off('OnViewerCountChanged', handleViewerCountChanged)

      void (async () => {
        try {
          if (connection.state === HubConnectionState.Connected) {
            await connection.invoke('LeaveRoom')
          }
        } catch (leaveError) {
          console.error('离开直播间失败', leaveError)
        } finally {
          try {
            await connection.stop()
          } catch (stopError) {
            console.error('关闭 SignalR 连接失败', stopError)
          }
        }
      })()
    }
  }, [roomNumber])

  return {
    roomDetail,
    onlineCount,
    isLoading,
    isConnecting,
    error,
  }
}
