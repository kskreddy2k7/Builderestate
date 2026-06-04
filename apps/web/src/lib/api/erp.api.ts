import { get, post, put, patch, del } from './client'
import type { PaginatedResponse, PaginationQuery } from '@buildestate/types'
import type { Booking, Payment, DemandLetter, ProjectBudget, BookingStatus, PaymentStatus } from '@buildestate/types'

const erpApi = {
  // Placeholder — full implementation generated during module build phase
  getAll: (params?: PaginationQuery) =>
    get<PaginatedResponse<Booking>>('/erp', params as Record<string, unknown>),

  getById: (id: string) =>
    get<Booking>(`/erp/${id}`),

  create: (data: unknown) =>
    post<Booking>('/erp', data),

  update: (id: string, data: unknown) =>
    patch<Booking>(`/erp/${id}`, data),

  remove: (id: string) =>
    del<void>(`/erp/${id}`),
}

export default erpApi
