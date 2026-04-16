import { useEffect, useState, useRef, useCallback } from 'react'
import { HubConnectionBuilder, HubConnectionState, HubConnection, LogLevel } from '@microsoft/signalr'
import request from '@/api/request'
import { getLiveRoomDetail, type LiveRoomDetailDto } from '@/api/Live/roomApi'
import { useUserStore } from '@/store/User/useUserStore'

// 💡 定义弹幕类型，严格映射后端负载
export interface ChatMessage {
  userId: string
  userName: string
  message: string
  sendTime: string
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]) // 👈 新增：弹幕列表状态

  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 👈 新增：使用 ref 保存当前的连接实例，以便外部的 sendMessage 方法调用
  const connectionRef = useRef<HubConnection | null>(null)

  // 👈 新增：暴露给 UI 层的发送弹幕方法
  const sendMessage = useCallback(async (content: string) => {
    if (connectionRef.current?.state === HubConnectionState.Connected && roomNumber) {
      await connectionRef.current.invoke('SendMessage', roomNumber, content)
    } else {
      throw new Error('直播间连接尚未建立或已断开')
    }
  }, [roomNumber])

  // ================= 1. 拉取房间 HTTP 详情 =================
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
        const detail = await getLiveRoomDetail(roomNumber)
        if (isDisposed) return

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

  // ================= 2. 建立 SignalR 长连接 =================
  useEffect(() => {
    if (!roomNumber) return

    let isDisposed = false

    const connection = new HubConnectionBuilder()
      .withUrl(buildHubUrl(), {
        accessTokenFactory: () => {
          const tokenData = useUserStore.getState().token;
          if (!tokenData) return '';
          const actualToken = typeof tokenData === 'string' ? tokenData : (tokenData as any).accessToken;
          return actualToken ?? '';
        },
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    // 将 connection 挂载到 ref，供 sendMessage 使用
    connectionRef.current = connection

    // --- 事件监听器定义 ---
    const handleViewerCountChanged = (nextOnlineCount: number) => {
      setOnlineCount(nextOnlineCount)
    }

    // 👈 新增：处理接收到的新弹幕
    const handleChatMessageReceived = (payload: ChatMessage) => {
      setMessages((prev) => {
        // 性能防御：最多在内存/DOM中保留 100 条弹幕，防止浏览器卡死
        const newMessages = [...prev, payload]
        return newMessages.slice(-100)
      })
    }

    // --- 绑定事件 ---
    connection.on('OnViewerCountChanged', handleViewerCountChanged)
    connection.on('OnChatMessageReceived', handleChatMessageReceived)

    // --- 启动连接 ---
    const connect = async () => {
      setIsConnecting(true)

      try {
        await connection.start()
        if (isDisposed) return

        await connection.invoke('JoinRoom', roomNumber)

        // 可选：连接成功后插入一条本地系统提示
        if (!isDisposed) {
          setMessages([{
            userId: 'system',
            userName: '系统提示',
            message: '已连接至聊天服务器，请文明发言。',
            sendTime: new Date().toISOString()
          }])
        }
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

    // --- 优雅的清理逻辑 ---
    return () => {
      isDisposed = true

      // 卸载事件监听，防止内存泄漏
      connection.off('OnViewerCountChanged', handleViewerCountChanged)
      connection.off('OnChatMessageReceived', handleChatMessageReceived)

      connectionRef.current = null

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
    messages,     // 👈 导出给 ChatPanel
    sendMessage,  // 👈 导出给 ChatPanel
    isLoading,
    isConnecting,
    error,
  }
}