import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/lib/api/auth.api'
import type { AuthUser, UserRole } from '@buildestate/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser) => void
  logout: () => void
  refresh: () => Promise<string>
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      setUser: (user) => {
        set({ user })
      },

      logout: () => {
        const { refreshToken } = get()
        if (refreshToken) {
          authApi.logout(refreshToken).catch(() => {/* ignore */})
        }
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false })
      },

      refresh: async () => {
        const { refreshToken } = get()
        if (!refreshToken) throw new Error('No refresh token')

        const tokens = await authApi.refresh({ refreshToken })
        set({ accessToken: tokens.accessToken })
        return tokens.accessToken
      },

      hasRole: (role) => {
        const { user } = get()
        return user?.roles.includes(role) ?? false
      },

      hasAnyRole: (roles) => {
        const { user } = get()
        if (!user) return false
        return roles.some((role) => user.roles.includes(role))
      },
    }),
    {
      name: 'buildestate-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
