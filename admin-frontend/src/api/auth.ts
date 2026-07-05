import request from './request'
import type { ApiResponse, LoginParams, UserInfo } from '../types'

export async function login(params: LoginParams): Promise<ApiResponse<{ access_token: string; token_type: string }>> {
  const response = await request.post<ApiResponse<{ access_token: string; token_type: string }>>('/auth/login', params)
  return response.data
}

export async function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  const response = await request.get<ApiResponse<UserInfo>>('/auth/me')
  return response.data
}
