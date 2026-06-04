import { get, post, patch, uploadFile } from './client'

const buyerApi = {
  getDashboard: () => get<any>('/buyer/dashboard'),
  getBookings: (page?: number) => get<any>('/buyer/bookings', { page }),
  getBooking: (id: string) => get<any>(`/buyer/bookings/${id}`),
  getPayments: (bookingId?: string) => get<any>('/buyer/payments', bookingId ? { bookingId } : {}),
  initiatePayment: (bookingId: string, scheduleItemId: string) =>
    post<any>('/buyer/payments/initiate', { bookingId, scheduleItemId }),
  verifyPayment: (data: Record<string, string>) => post<any>('/buyer/payments/verify', data),
  getDocuments: (bookingId?: string) => get<any>('/buyer/documents', bookingId ? { bookingId } : {}),
  getDemandLetters: (bookingId?: string) => get<any>('/buyer/demand-letters', bookingId ? { bookingId } : {}),
  getProgress: (bookingId: string, page?: number) => get<any>(`/buyer/bookings/${bookingId}/progress`, { page }),
  getMilestones: (bookingId: string) => get<any>(`/buyer/bookings/${bookingId}/milestones`),
  createComplaint: (data: Record<string, unknown>) => post<any>('/buyer/complaints', data),
  getComplaints: (params?: Record<string, unknown>) => get<any>('/buyer/complaints', params),
  getComplaint: (id: string) => get<any>(`/buyer/complaints/${id}`),
  addComplaintUpdate: (id: string, data: Record<string, unknown>) => post<any>(`/buyer/complaints/${id}/updates`, data),
  getNotifications: (page?: number) => get<any>('/buyer/notifications', { page }),
  markNotificationRead: (id: string) => patch<any>(`/buyer/notifications/${id}/read`),
  markAllNotificationsRead: () => post<any>('/buyer/notifications/read-all'),
}

export default buyerApi
