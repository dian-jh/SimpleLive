import { useEffect, useState } from 'react'
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import request from '@/api/request'
import { getLiveRoomDetailApi, type LiveRoomDetailDto } from '@/api/Live/roomApi'
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

    const loadRoomDetail = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const detail = await getLiveRoomDetailApi(roomNumber)
        if (isDisposed) {
          return
        }

        setRoomDetail(detail)
        setOnlineCount(detail.OnlineCount)
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
        // 教学点：SignalR 的握手走的是 WebSocket/长连接链路，不会经过 axios 请求拦截器。
        // 所以 token 要放在 accessTokenFactory 中，不能只依赖 axios 全局 Authorization Header。
        accessTokenFactory: () => useUserStore.getState().token ?? '',
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
          // 教学点：这里相当于后端服务里的 finally 资源释放。
          // 路由切换触发 cleanup 后会先 LeaveRoom，再 stop 连接，避免服务端误判用户还在房间里挂机。
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
