import request from './request'
import type { ApiResponse, PaginatedResponse } from '../types'

export interface Feedback {
  id: number
  content: string
  contact: string
  images: string[]
  user_id: string
  status: number
  handler_note: string
  handled_at: string
  created_at: string
}

export const feedbackApi = {
  list: (params: {
    page?: number
    page_size?: number
    status?: number
  }): Promise<ApiResponse<PaginatedResponse<Feedback>>> =>
    request.get<ApiResponse<PaginatedResponse<Feedback>>>('/feedback', { params }).then((res) => res.data),
  updateStatus: (
    id: number,
    data: { status: number; handler_note?: string }
  ): Promise<ApiResponse<Feedback>> =>
    request.put<ApiResponse<Feedback>>(`/feedback/${id}/status`, data).then((res) => res.data),
}
