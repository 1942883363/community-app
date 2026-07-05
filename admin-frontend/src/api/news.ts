import request from './request'
import type { ApiResponse, PaginatedResponse } from '../types'

export interface Category {
  id: number
  name: string
  parent_id: number | null
  sort_order: number
  children?: Category[]
  created_at: string
  updated_at: string
}

export interface News {
  id: number
  title: string
  summary: string
  content: string
  cover_image: string
  category_id: number
  view_count: number
  like_count: number
  status: number
  is_top: number
  published_at: string
  created_at: string
  updated_at: string
}

export const categoryApi = {
  list: (): Promise<ApiResponse<Category[]>> =>
    request.get<ApiResponse<Category[]>>('/categories').then((res) => res.data),
  create: (data: Partial<Category>): Promise<ApiResponse<Category>> =>
    request.post<ApiResponse<Category>>('/categories', data).then((res) => res.data),
  update: (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> =>
    request.put<ApiResponse<Category>>(`/categories/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/categories/${id}`).then((res) => res.data),
}

export const newsApi = {
  list: (params: {
    page?: number
    page_size?: number
    keyword?: string
    category_id?: number
    status?: number
  }): Promise<ApiResponse<PaginatedResponse<News>>> =>
    request.get<ApiResponse<PaginatedResponse<News>>>('/news', { params }).then((res) => res.data),
  getById: (id: number): Promise<ApiResponse<News>> =>
    request.get<ApiResponse<News>>(`/news/${id}`).then((res) => res.data),
  create: (data: FormData | Record<string, unknown>): Promise<ApiResponse<News>> =>
    request.post<ApiResponse<News>>('/news', data).then((res) => res.data),
  update: (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse<News>> =>
    request.put<ApiResponse<News>>(`/news/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/news/${id}`).then((res) => res.data),
}
