import { useCallback, useEffect, useState } from 'react'
import { getLiveRooms, type LiveRoomSummaryDto } from '@/api/Live/roomApi'

interface UseRoomListOptions {
  pageIndex?: number
  pageSize?: number
}

const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '加载直播大厅失败，请稍后重试'
}

export const useRoomList = (options: UseRoomListOptions = {}) => {
  const [rooms, setRooms] = useState<LiveRoomSummaryDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pageIndex = options.pageIndex ?? 1
  const pageSize = options.pageSize ?? 20

  const loadRooms = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getLiveRooms({ pageIndex, pageSize })
      setRooms(response)
    } catch (requestError) {
      setError(parseErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [pageIndex, pageSize])

  useEffect(() => {
    // 不能把 useEffect 回调直接写成 async：
    // async effect 会返回 Promise，和 C# 里的 async void 一样，异常不容易被生命周期正确感知。
    const loadRoomsInEffect = async () => {
      await loadRooms()
    }

    void loadRoomsInEffect()
  }, [loadRooms])

  return {
    rooms,
    isLoading,
    error,
    refresh: loadRooms,
  }
}
