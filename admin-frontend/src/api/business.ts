import request from './request'
import type { ApiResponse, PaginatedResponse } from '../types'

export interface BusinessCategory {
  id: number
  name: string
  icon: string
  sort_order: number
}

export interface Business {
  id: number
  category_id: number
  name: string
  logo: string
  address: string
  phone: string
  description: string
  business_hours: string
  sort_order: number
  status: number
}

export const businessCategoryApi = {
  list: (): Promise<ApiResponse<BusinessCategory[]>> =>
    request.get<ApiResponse<BusinessCategory[]>>('/business-categories').then((res) => res.data),
  create: (data: Partial<BusinessCategory>): Promise<ApiResponse<BusinessCategory>> =>
    request.post<ApiResponse<BusinessCategory>>('/business-categories', data).then((res) => res.data),
  update: (id: number, data: Partial<BusinessCategory>): Promise<ApiResponse<BusinessCategory>> =>
    request
      .put<ApiResponse<BusinessCategory>>(`/business-categories/${id}`, data)
      .then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/business-categories/${id}`).then((res) => res.data),
}

export const businessApi = {
  list: (params: {
    page?: number
    page_size?: number
    category_id?: number
  }): Promise<ApiResponse<PaginatedResponse<Business>>> =>
    request
      .get<ApiResponse<PaginatedResponse<Business>>>('/businesses', { params })
      .then((res) => res.data),
  getById: (id: number): Promise<ApiResponse<Business>> =>
    request.get<ApiResponse<Business>>(`/businesses/${id}`).then((res) => res.data),
  create: (data: Partial<Business>): Promise<ApiResponse<Business>> =>
    request.post<ApiResponse<Business>>('/businesses', data).then((res) => res.data),
  update: (id: number, data: Partial<Business>): Promise<ApiResponse<Business>> =>
    request.put<ApiResponse<Business>>(`/businesses/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/businesses/${id}`).then((res) => res.data),
}
