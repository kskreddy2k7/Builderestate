import { get, post, patch, del, uploadFile } from './client'

export interface PropertySearchParams {
  search?: string
  type?: string
  transactionType?: string
  city?: string
  state?: string
  pincode?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bhkType?: string
  reraVerified?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const marketplaceApi = {
  search: (params: PropertySearchParams) =>
    get<any>('/marketplace', params as Record<string, unknown>),

  getFeatured: (limit = 6) =>
    get<any[]>('/marketplace/featured', { limit }),

  getBySlug: (slug: string) =>
    get<any>(`/marketplace/slug/${slug}`),

  getById: (id: string) =>
    get<any>(`/marketplace/${id}`),

  create: (data: Record<string, unknown>) =>
    post<any>('/marketplace', data),

  update: (id: string, data: Record<string, unknown>) =>
    patch<any>(`/marketplace/${id}`, data),

  remove: (id: string) =>
    del<void>(`/marketplace/${id}`),

  submitForReview: (id: string) =>
    post<{ message: string }>(`/marketplace/${id}/submit`),

  verify: (id: string, data: { decision: string; reason?: string }) =>
    post<any>(`/marketplace/${id}/verify`, data),

  uploadMedia: (id: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    return uploadFile<{ uploaded: number }>(`/marketplace/${id}/media`, formData)
  },

  createEnquiry: (propertyId: string, data: {
    name: string; email: string; phone: string; message?: string; budget?: number
  }) => post<any>(`/marketplace/${propertyId}/enquiry`, data),

  toggleSave: (id: string) =>
    post<{ saved: boolean }>(`/marketplace/${id}/save`),

  getSaved: (page = 1) =>
    get<any>('/marketplace/saved', { page }),

  getMyListings: (page = 1, status?: string) =>
    get<any>('/marketplace/my-listings', { page, ...(status && { status }) }),

  getStats: () =>
    get<any>('/marketplace/stats'),
}

export default marketplaceApi
