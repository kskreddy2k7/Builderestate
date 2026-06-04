'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import crmApi from '@/lib/api/crm.api'
import { queryKeys } from '@/lib/query-keys'

// ─── Leads ────────────────────────────────────────────────────────────────────

export function useLeads(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: queryKeys.leads.all(params),
    queryFn: () => crmApi.getLeads(params),
    staleTime: 60 * 1000,
  })
}

export function usePipeline() {
  return useQuery({
    queryKey: queryKeys.leads.pipeline('me'),
    queryFn: () => crmApi.getPipeline(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useLead(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => crmApi.getLead(id),
    enabled: enabled && !!id,
  })
}

export function useLeadActivities(leadId: string) {
  return useQuery({
    queryKey: queryKeys.leads.activities(leadId),
    queryFn: () => crmApi.getActivities(leadId),
    enabled: !!leadId,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => crmApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead created')
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to create lead'),
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      crmApi.updateLead(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead updated')
    },
  })
}

export function useAddActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: Record<string, unknown> }) =>
      crmApi.addActivity(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.activities(leadId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId) })
      toast.success('Activity logged')
    },
  })
}

export function useScheduleSiteVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: Record<string, unknown> }) =>
      crmApi.scheduleSiteVisit(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.siteVisits(leadId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId) })
      toast.success('Site visit scheduled')
    },
  })
}

// ─── Commissions ──────────────────────────────────────────────────────────────

export function useCommissions(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: queryKeys.commissions.all(params),
    queryFn: () => crmApi.getCommissions(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCommission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => crmApi.createCommission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
      toast.success('Commission created')
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed'),
  })
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function useCustomers(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: queryKeys.customers.all('org', params),
    queryFn: () => crmApi.getCustomers(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => crmApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer created')
    },
  })
}

// ─── Site Visits ──────────────────────────────────────────────────────────────

export function useSiteVisits(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['site-visits', params],
    queryFn: () => crmApi.getSiteVisits(params),
    staleTime: 60 * 1000,
  })
}
