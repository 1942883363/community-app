import request from './request'
import type { ApiResponse, PaginatedResponse } from '../types'

export interface Event {
  id: number
  title: string
  cover_image: string
  content: string
  location: string
  start_time: string
  end_time: string
  max_participants: number
  current_count: number
  status: number
}

export interface Registration {
  id: number
  event_id: number
  user_id: string
  name: string
  phone: string
  created_at: string
}

export const eventApi = {
  list: (params: {
    page?: number
    page_size?: number
  }): Promise<ApiResponse<PaginatedResponse<Event>>> =>
    request.get<ApiResponse<PaginatedResponse<Event>>>('/events', { params }).then((res) => res.data),
  getById: (id: number): Promise<ApiResponse<Event>> =>
    request.get<ApiResponse<Event>>(`/events/${id}`).then((res) => res.data),
  create: (data: Partial<Event>): Promise<ApiResponse<Event>> =>
    request.post<ApiResponse<Event>>('/events', data).then((res) => res.data),
  update: (id: number, data: Partial<Event>): Promise<ApiResponse<Event>> =>
    request.put<ApiResponse<Event>>(`/events/${id}`, data).then((res) => res.data),
  delete: (id: number): Promise<ApiResponse<null>> =>
    request.delete<ApiResponse<null>>(`/events/${id}`).then((res) => res.data),
  getRegistrations: (
    id: number,
    params?: { page?: number; page_size?: number }
  ): Promise<ApiResponse<PaginatedResponse<Registration>>> =>
    request
      .get<ApiResponse<PaginatedResponse<Registration>>>(`/events/${id}/registrations`, { params })
      .then((res) => res.data),
}
