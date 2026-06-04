'use client'

import { useWebSocket } from '@/hooks/use-websocket'
import { useAuthStore } from '@/store/auth.store'

// Mount in authenticated layouts to start WS connection
export function WebSocketInitializer() {
  const { isAuthenticated } = useAuthStore()
  useWebSocket()
  return null
}
