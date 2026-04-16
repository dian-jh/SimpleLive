import type { AxiosResponse } from 'axios'
import request from '@/api/request'

const USER_PROFILE_PREFIX = '/api/UserProfile'

export interface UserProfileDto {
  avatarUrl: string | null
  nickName: string
  gender: number
  location: string | null
  signature: string | null
  followingCount: number
  dateOfBirth?: string | null
  age?: number | null
}

export interface PagedResultDto<T> {
  queryable: T[]       // 注意：C# 默认转小驼峰，所以 Queryable 变成了 queryable
  currentPage: number
  pageSize: number
  rowCount: number
  pageCount: number
}

// 关注主播 DTO
export interface FollowingUserDto {
  hostId: string
  nickName: string
  avatarUrl: string | null
  isLive: boolean
  viewerCount: number
  followerCount: number
}

// 观看历史 DTO
export interface WatchHistoryDto {
  roomNumber: string
  lastWatchTime: string // DateTime 在 TS 中通常作为 ISO 字符串接收
}

export interface UpdateProfileDto {
  nickName: string
  signature: string | null
  gender: number
  dateOfBirth: string | null // 对应 C# DateOnly，格式需为 "YYYY-MM-DD"
  location: string | null
}

// --- 导出异步请求方法 ---

export const getMyFollowsApi = async (pageIndex = 1, pageSize = 20) => {
  const response = await request.get<PagedResultDto<FollowingUserDto>>(`${USER_PROFILE_PREFIX}/follows`, {
    params: { pageIndex, pageSize },
  })
  return response.data
}

export const getMyHistoryApi = async (pageIndex = 1, pageSize = 20) => {
  const response = await request.get<PagedResultDto<WatchHistoryDto>>(`${USER_PROFILE_PREFIX}/history`, {
    params: { pageIndex, pageSize },
  })
  return response.data
}

export const getMyProfileApi = async (): Promise<UserProfileDto> => {
  const response = await request.get<UserProfileDto, AxiosResponse<UserProfileDto>>(
    `${USER_PROFILE_PREFIX}/me`,
  )

  return response.data
}

export const updateMyProfileApi = async (data: UpdateProfileDto): Promise<void> => {
  await request.put(`${USER_PROFILE_PREFIX}/me`, data)
}
