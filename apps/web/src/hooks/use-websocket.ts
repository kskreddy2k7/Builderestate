'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'

let globalSocket: Socket | null = null

export function useWebSocket() {
  const queryClient = useQueryClient()
  const { accessToken, isAuthenticated } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) return
    if (globalSocket?.connected) {
      socketRef.current = globalSocket
      return
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      console.info('[WS] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.info('[WS] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.warn('[WS] Connection error:', err.message)
    })

    // ─── Payment events ──────────────────────────────────────────────────
    socket.on('payment:received', (data: { bookingId: string; amount: number }) => {
      toast.success(`Payment of ₹${data.amount.toLocaleString('en-IN')} confirmed`)
      queryClient.invalidateQueries({ queryKey: ['buyer', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['buyer', 'dashboard'] })
    })

    // ─── Progress events ──────────────────────────────────────────────────
    socket.on('progress:update', (data: { title: string; percentage: number }) => {
      toast.info(`Construction update: ${data.title} (${data.percentage}%)`)
      queryClient.invalidateQueries({ queryKey: ['buyer', 'progress'] })
    })

    // ─── Lead events ─────────────────────────────────────────────────────
    socket.on('lead:assigned', (data: { leadId: string; name: string; phone: string }) => {
      toast.info(`New lead assigned: ${data.name} (${data.phone})`)
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    })

    // ─── Booking events ───────────────────────────────────────────────────
    socket.on('booking:confirmed', (data: { bookingNumber: string; unitNumber: string }) => {
      toast.success(`Booking confirmed: ${data.bookingNumber} for Unit ${data.unitNumber}`)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    })

    // ─── NCR events ───────────────────────────────────────────────────────
    socket.on('ncr:raised', (data: { ncrNumber: string; severity: string }) => {
      const variant = data.severity === 'CRITICAL' ? 'error' : data.severity === 'MAJOR' ? 'warning' : 'info'
      toast[variant === 'error' ? 'error' : variant === 'warning' ? 'warning' : 'info'](
        `NCR ${data.ncrNumber} raised (${data.severity})`
      )
      queryClient.invalidateQueries({ queryKey: ['ncr'] })
    })

    // ─── Notification badge ───────────────────────────────────────────────
    socket.on('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['buyer', 'notifications'] })
    })

    globalSocket = socket
    socketRef.current = socket
  }, [isAuthenticated, accessToken, queryClient])

  const disconnect = useCallback(() => {
    globalSocket?.disconnect()
    globalSocket = null
    socketRef.current = null
  }, [])

  const joinProject = useCallback((projectId: string) => {
    socketRef.current?.emit('join:project', { projectId })
  }, [])

  const leaveProject = useCallback((projectId: string) => {
    socketRef.current?.emit('leave:project', { projectId })
  }, [])

  useEffect(() => {
    connect()
    return () => {
      // Don't disconnect on unmount — keep persistent connection
    }
  }, [connect])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    joinProject,
    leaveProject,
    disconnect,
  }
}
