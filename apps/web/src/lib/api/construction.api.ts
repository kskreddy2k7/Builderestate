import { get, post, put, patch, del } from './client'
import type { PaginatedResponse, PaginationQuery } from '@buildestate/types'
import type { Project, Milestone, ProgressUpdate, DailySiteReport, QualityCheck } from '@buildestate/types'

const constructionApi = {
  // Placeholder — full implementation generated during module build phase
  getAll: (params?: PaginationQuery) =>
    get<PaginatedResponse<Project>>('/construction', params as Record<string, unknown>),

  getById: (id: string) =>
    get<Project>(`/construction/${id}`),

  create: (data: unknown) =>
    post<Project>('/construction', data),

  update: (id: string, data: unknown) =>
    patch<Project>(`/construction/${id}`, data),

  remove: (id: string) =>
    del<void>(`/construction/${id}`),
}

export default constructionApi
