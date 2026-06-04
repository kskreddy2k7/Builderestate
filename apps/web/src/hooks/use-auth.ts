'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/lib/api/auth.api'
import { queryKeys } from '@/lib/query-keys'
import type { LoginDto, RegisterDto, UserRole } from '@buildestate/types'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const store = useAuthStore()

  // ─── Get current user (SSR-safe) ─────────────────────────────────────────

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.me,
    enabled: store.isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  // ─── Login ────────────────────────────────────────────────────────────────

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (response) => {
      store.setTokens(response.tokens.accessToken, response.tokens.refreshToken)
      store.setUser(response.user)
      queryClient.setQueryData(queryKeys.auth.me(), response.user)
      toast.success(`Welcome back, ${response.user.name}!`)
      router.push(getDashboardRoute(response.user.roles))
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      toast.error(message)
    },
  })

  // ─── Register ─────────────────────────────────────────────────────────────

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (response) => {
      store.setTokens(response.tokens.accessToken, response.tokens.refreshToken)
      store.setUser(response.user)
      toast.success('Account created! Please verify your email.')
      router.push(getDashboardRoute(response.user.roles))
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  // ─── Logout ───────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    store.logout()
    queryClient.clear()
    router.push('/login')
    toast.info('You have been logged out')
  }, [store, queryClient, router])

  // ─── Role helpers ─────────────────────────────────────────────────────────

  const hasRole = useCallback(
    (role: UserRole) => store.user?.roles.includes(role) ?? false,
    [store.user],
  )

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => roles.some((r) => store.user?.roles.includes(r)) ?? false,
    [store.user],
  )

  return {
    user: user ?? store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: isLoadingUser,
    accessToken: store.accessToken,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,

    logout,
    hasRole,
    hasAnyRole,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDashboardRoute(roles: UserRole[]): string {
  const roleRoutes: Partial<Record<UserRole, string>> = {
    SUPER_ADMIN: '/admin/dashboard',
    ADMIN: '/admin/dashboard',
    BUILDER: '/builder/dashboard',
    BROKER: '/broker/dashboard',
    AGENT: '/broker/dashboard',
    BUYER: '/buyer/dashboard',
    CONTRACTOR: '/contractor/dashboard',
    SITE_ENGINEER: '/engineer/dashboard',
    SUPPLIER: '/supplier/dashboard',
  }

  for (const role of roles) {
    const route = roleRoutes[role]
    if (route) return route
  }

  return '/marketplace'
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Axios errors
    const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
    return axiosError.response?.data?.error?.message ?? error.message
  }
  return 'An unexpected error occurred'
}
