import request from './request'
import type { ApiResponse } from '../types'

export interface PhoneCategory {
  id: number
  name: string
  icon: string
  sort_order: number
}

export interface PhoneEntry {
  id: number
  category_id: number
  name: string
  phone_number: string
  remark: string
  sort_order: number
}

export const phoneCategoryApi = {
  list: (): Promise<ApiResponse<PhoneCategory[]>> =>
    request.get<ApiResponse<PhoneCategory[]>>('/phone-categories').then((res) => res.data),
  create: (data: Partial<PhoneCategory>): Promise<ApiResponse<PhoneCategory>> =>
    request.post<ApiResponse<PhoneCategory>>('/phone-categories', data).then((res) => res.data),
  update: (id: number, data: Partial<PhoneCategory>): Promise<ApiResponse<PhoneCategory>> =>
    request.put<ApiResponse<PhoneCategory>>(`/phone-categories/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/phone-categories/${id}`).then((res) => res.data),
}

export const phoneEntryApi = {
  list: (category_id: number): Promise<ApiResponse<PhoneEntry[]>> =>
    request
      .get<ApiResponse<PhoneEntry[]>>('/phone-entries', { params: { category_id } })
      .then((res) => res.data),
  create: (data: Partial<PhoneEntry>): Promise<ApiResponse<PhoneEntry>> =>
    request.post<ApiResponse<PhoneEntry>>('/phone-entries', data).then((res) => res.data),
  update: (id: number, data: Partial<PhoneEntry>): Promise<ApiResponse<PhoneEntry>> =>
    request.put<ApiResponse<PhoneEntry>>(`/phone-entries/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/phone-entries/${id}`).then((res) => res.data),
}
