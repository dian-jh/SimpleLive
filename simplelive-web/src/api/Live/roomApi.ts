import type { AxiosResponse } from 'axios'
import request from '@/api/request'

const LIVE_ROOM_PREFIX = '/api/liverooms'

export interface LiveRoomSummaryDto {
  id: number
  roomNumber: string
  categoryId: number
  hostUserName: string
  hostAvatarUrl: string
  title: string
  coverImageUrl: string
  notice: string
  status: number
  onlineCount: number
}

export interface LiveRoomDetailDto extends LiveRoomSummaryDto {
  hostId: string
  playUrl: string
}

export interface GetLiveRoomHomeParams {
  pageIndex?: number
  pageSize?: number
}

// ======== 替换或追加到 src/api/Live/roomApi.ts ========

export interface PrepareLiveResponse {
  roomNumber: string;
  streamKey: string;
  title: string;
  categoryId: number;
  notice: string | null;
}

export interface ApplyLiveSettingsRequest {
  CategoryId: number;
  Title: string;
  CoverImageUrl?: string;
  Notice?: string;
}

// 接口 1：获取推流信息 (Prepare)
export const prepareLiveRoom = async (): Promise<PrepareLiveResponse> => {
  const response = await request.post<PrepareLiveResponse>('/api/liverooms/prepare')
  return response.data
}

// 接口 2：保存开播设置 (Apply Settings)
export const applyLiveSettings = async (data: ApplyLiveSettingsRequest): Promise<void> => {
  await request.post('/api/liverooms/apply-settings', data)
}

export const getLiveRooms = async (
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


export const getLiveRoomDetail = async (
  roomNumber: string,
): Promise<LiveRoomDetailDto> => {
  const response = await request.get<
    LiveRoomDetailDto,
    AxiosResponse<LiveRoomDetailDto>
  >(`${LIVE_ROOM_PREFIX}/${roomNumber}`)

  return response.data
}
