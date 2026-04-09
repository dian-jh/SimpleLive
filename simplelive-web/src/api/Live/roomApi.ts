import type { AxiosResponse } from 'axios'
import request from '@/api/request'

const LIVE_ROOM_PREFIX = '/api/liverooms'

export interface LiveRoomSummaryDto {
  Id: number
  RoomNumber: string
  CategoryId: number
  HostUserName: string
  HostAvatarUrl: string
  Title: string
  CoverImageUrl: string
  Notice: string
  Status: number
  OnlineCount: number
}

export interface LiveRoomDetailDto extends LiveRoomSummaryDto {
  HostId: string
  PlayUrl: string
}

export interface GetLiveRoomHomeParams {
  pageIndex?: number
  pageSize?: number
}

export const getLiveRoomHomeApi = async (
  params: GetLiveRoomHomeParams = {},
): Promise<LiveRoomSummaryDto[]> => {
  const response = await request.get<
    LiveRoomSummaryDto[],
    AxiosResponse<LiveRoomSummaryDto[]>
  >(`${LIVE_ROOM_PREFIX}/home`, {
    params: {
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  })

  return response.data
}

export const getLiveRoomDetailApi = async (
  roomNumber: string,
): Promise<LiveRoomDetailDto> => {
  const response = await request.get<
    LiveRoomDetailDto,
    AxiosResponse<LiveRoomDetailDto>
  >(`${LIVE_ROOM_PREFIX}/${roomNumber}`)

  return response.data
}
