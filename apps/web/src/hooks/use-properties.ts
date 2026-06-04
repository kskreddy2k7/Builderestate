'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import marketplaceApi, { type PropertySearchParams } from '@/lib/api/marketplace.api'
import { queryKeys } from '@/lib/query-keys'

// ─── Search / List ────────────────────────────────────────────────────────────

export function useProperties(params: PropertySearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.properties.search(params as Record<string, unknown>),
    queryFn: () => marketplaceApi.search(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useFeaturedProperties(limit = 6) {
  return useQuery({
    queryKey: ['properties', 'featured', limit],
    queryFn: () => marketplaceApi.getFeatured(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProperty(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => marketplaceApi.getById(id),
    enabled: enabled && !!id,
  })
}

export function usePropertyBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.properties.bySlug(slug),
    queryFn: () => marketplaceApi.getBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyListings(page = 1, status?: string) {
  return useQuery({
    queryKey: queryKeys.properties.all({ page, status }),
    queryFn: () => marketplaceApi.getMyListings(page, status),
    staleTime: 60 * 1000,
  })
}

export function useSavedProperties(page = 1) {
  return useQuery({
    queryKey: queryKeys.properties.saved('me'),
    queryFn: () => marketplaceApi.getSaved(page),
  })
}

export function usePropertyStats() {
  return useQuery({
    queryKey: ['properties', 'stats'],
    queryFn: () => marketplaceApi.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => marketplaceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property created as draft')
    },
    onError: () => toast.error('Failed to create property'),
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      marketplaceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property updated')
    },
    onError: () => toast.error('Failed to update property'),
  })
}

export function useSubmitForReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => marketplaceApi.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('Property submitted for review')
    },
    onError: () => toast.error('Failed to submit property'),
  })
}

export function useUploadPropertyMedia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      marketplaceApi.uploadMedia(id, files),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) })
      toast.success(`${data.uploaded} photo(s) uploaded`)
    },
    onError: () => toast.error('Upload failed'),
  })
}

export function useCreateEnquiry() {
  return useMutation({
    mutationFn: ({ propertyId, data }: {
      propertyId: string
      data: { name: string; email: string; phone: string; message?: string; budget?: number }
    }) => marketplaceApi.createEnquiry(propertyId, data),
    onSuccess: () => toast.success('Enquiry submitted! We\'ll contact you shortly.'),
    onError: () => toast.error('Failed to submit enquiry'),
  })
}

export function useToggleSave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => marketplaceApi.toggleSave(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.saved('me') })
      toast.success(data.saved ? 'Property saved' : 'Property removed from saved')
    },
  })
}
