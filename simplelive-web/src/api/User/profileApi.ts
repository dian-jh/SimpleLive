import type { AxiosResponse } from 'axios'
import request from '@/api/request'

const USER_PROFILE_PREFIX = '/api/UserProfile'

export interface UserProfileDto {
  avatarUrl: string | null
  nickName: string
  age: number | null
  gender: number
  location: string | null
  signature: string | null
  followingCount: number
  followerCount: number
}

export const getMyProfileApi = async (): Promise<UserProfileDto> => {
  const response = await request.get<UserProfileDto, AxiosResponse<UserProfileDto>>(
    `${USER_PROFILE_PREFIX}/me`,
  )

  return response.data
}
