'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import buyerApi from '@/lib/api/buyer.api'

export function useBuyerDashboard() {
  return useQuery({
    queryKey: ['buyer', 'dashboard'],
    queryFn: () => buyerApi.getDashboard(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useMyBookings(page = 1) {
  return useQuery({
    queryKey: ['buyer', 'bookings', page],
    queryFn: () => buyerApi.getBookings(page),
  })
}

export function useMyBooking(id: string, enabled = true) {
  return useQuery({
    queryKey: ['buyer', 'booking', id],
    queryFn: () => buyerApi.getBooking(id),
    enabled: enabled && !!id,
  })
}

export function usePaymentSummary(bookingId?: string) {
  return useQuery({
    queryKey: ['buyer', 'payments', bookingId],
    queryFn: () => buyerApi.getPayments(bookingId),
    staleTime: 60 * 1000,
  })
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: ({ bookingId, scheduleItemId }: { bookingId: string; scheduleItemId: string }) =>
      buyerApi.initiatePayment(bookingId, scheduleItemId),
    onError: () => toast.error('Failed to initiate payment'),
  })
}

export function useVerifyPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, string>) => buyerApi.verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['buyer', 'dashboard'] })
      toast.success('Payment successful!')
    },
    onError: () => toast.error('Payment verification failed'),
  })
}

export function useMyDocuments(bookingId?: string) {
  return useQuery({
    queryKey: ['buyer', 'documents', bookingId],
    queryFn: () => buyerApi.getDocuments(bookingId),
  })
}

export function useDemandLetters(bookingId?: string) {
  return useQuery({
    queryKey: ['buyer', 'demand-letters', bookingId],
    queryFn: () => buyerApi.getDemandLetters(bookingId),
  })
}

export function useConstructionProgress(bookingId: string, page = 1) {
  return useQuery({
    queryKey: ['buyer', 'progress', bookingId, page],
    queryFn: () => buyerApi.getProgress(bookingId, page),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyComplaints(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['buyer', 'complaints', params],
    queryFn: () => buyerApi.getComplaints(params),
  })
}

export function useCreateComplaint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => buyerApi.createComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'complaints'] })
      toast.success('Complaint raised successfully')
    },
    onError: () => toast.error('Failed to raise complaint'),
  })
}

export function useMyNotifications(page = 1) {
  return useQuery({
    queryKey: ['buyer', 'notifications', page],
    queryFn: () => buyerApi.getNotifications(page),
    refetchInterval: 60 * 1000, // Poll every minute
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => buyerApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buyer', 'notifications'] }),
  })
}
