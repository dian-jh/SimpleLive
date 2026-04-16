import type { AxiosResponse } from 'axios'
import request from '@/api/request'

const AUTH_PREFIX = '/api/Auth'

export interface AuthErrorResponse {
  Message: string
}

export interface RegisterRequestDto {
  Account: string
  Password: string
}

export type RegisterResponseDto = void

export interface LoginRequestDto {
  Account: string
  Password: string
}

export interface LoginResponseDto {
  token: string
}

export const registerApi = async (
  payload: RegisterRequestDto,
): Promise<RegisterResponseDto> => {
  // 教学点：post<TResponse, TAxiosResponse, TRequest> 的泛型会同时约束请求和响应，
  // 编译期就能发现 DTO 字段拼写或类型错误，避免把后端契约问题拖到运行时。
  await request.post<
    RegisterResponseDto,
    AxiosResponse<RegisterResponseDto>,
    RegisterRequestDto
  >(`${AUTH_PREFIX}/register`, payload)
}

export const loginApi = async (
  payload: LoginRequestDto,
): Promise<LoginResponseDto> => {
  console.log("before request")
  const response = await request.post<
    LoginResponseDto,
    AxiosResponse<LoginResponseDto>,
    LoginRequestDto
  >(`${AUTH_PREFIX}/login`, payload)

  console.log("after request")

  return response.data
}
