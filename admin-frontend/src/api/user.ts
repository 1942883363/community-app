import request from './request'
import type { ApiResponse, PaginatedResponse } from '../types'

export interface User {
  id: number
  openid: string
  nickname: string
  phone: string
  avatar: string
  created_at: string
  updated_at: string
}

export const userApi = {
  list: (params: {
    page?: number
    page_size?: number
    keyword?: string
  }): Promise<ApiResponse<PaginatedResponse<User>>> =>
    request.get<ApiResponse<PaginatedResponse<User>>>('/users', { params }).then((res) => res.data),
  getById: (id: number): Promise<ApiResponse<User>> =>
    request.get<ApiResponse<User>>(`/users/${id}`).then((res) => res.data),
  update: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    request.put<ApiResponse<User>>(`/users/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/users/${id}`).then((res) => res.data),
}
