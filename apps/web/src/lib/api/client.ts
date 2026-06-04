import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

// ─── Create Axios Instance ────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
})

// ─── Request Interceptor — Attach JWT ────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response Interceptor — Token Refresh ────────────────────────────────────

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = useAuthStore
            .getState()
            .refresh()
            .finally(() => { refreshPromise = null })
        }

        const newToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  },
)

// ─── Typed helpers ────────────────────────────────────────────────────────────

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<{ success: true; data: T }>(url, { params })
  return response.data.data
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<{ success: true; data: T }>(url, data)
  return response.data.data
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<{ success: true; data: T }>(url, data)
  return response.data.data
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.patch<{ success: true; data: T }>(url, data)
  return response.data.data
}

export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<{ success: true; data: T }>(url)
  return response.data.data
}

export async function uploadFile<T>(url: string, formData: FormData): Promise<T> {
  const response = await apiClient.post<{ success: true; data: T }>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.data
}
