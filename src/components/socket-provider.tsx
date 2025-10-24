'use client'

import { createContext, useContext, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'

const SocketContext = createContext<ReturnType<typeof useSocket> | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket()

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}
