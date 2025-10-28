'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store/store'
import { SocketProvider } from './socket-provider'
import { setAuthHelpers } from '@/services/api'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up auth helpers to avoid circular dependency
    setAuthHelpers(
      () => store.getState().auth.accessToken,
      (action: any) => store.dispatch(action)
    )
  }, [])

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </PersistGate>
    </Provider>
  )
}
