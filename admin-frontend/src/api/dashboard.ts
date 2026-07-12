import request from './request'
import type { ApiResponse } from '../types'

export interface DashboardStats {
  news_count: number
  feedback_count: number
  phone_count: number
  event_count: number
  business_count: number
  user_count: number
}

export async function getStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await request.get<ApiResponse<DashboardStats>>('/dashboard/stats')
  return response.data
}
