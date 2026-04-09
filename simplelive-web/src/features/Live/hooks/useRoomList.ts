import { useCallback, useEffect, useState } from 'react'
import {
  getLiveRoomHomeApi,
  type LiveRoomSummaryDto,
} from '@/api/Live/roomApi'

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
      const response = await getLiveRoomHomeApi({
        pageIndex,
        pageSize,
      })
      setRooms(response)
    } catch (error) {
      setError(parseErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [pageIndex, pageSize])

  useEffect(() => {
    void loadRooms()
  }, [loadRooms])

  return {
    rooms,
    isLoading,
    error,
    refresh: loadRooms,
  }
}
