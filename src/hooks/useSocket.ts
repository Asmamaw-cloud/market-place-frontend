import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppDispatch, useAppSelector } from './redux'
import { setConnectionStatus, addMessage, updateMessage } from '@/store/slices/chatSlice'
import { addNotification } from '@/store/slices/notificationsSlice'
import { updateOrderOptimistic } from '@/store/slices/ordersSlice'
import { SocketEvents, SocketEmits } from '@/types'

export const useSocket = () => {
  const dispatch = useAppDispatch()
  const { isConnected } = useAppSelector(state => state.chat)
  const { accessToken } = useAppSelector(state => state.auth)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !accessToken) return

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected')
      dispatch(setConnectionStatus(true))
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      dispatch(setConnectionStatus(false))
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      dispatch(setConnectionStatus(false))
    })

    // Message events
    socket.on('message', (message) => {
      dispatch(addMessage(message))
    })

    socket.on('message:updated', (message) => {
      dispatch(updateMessage(message))
    })

    // Order events
    socket.on('order:updated', (order) => {
      dispatch(updateOrderOptimistic(order))
      dispatch(addNotification({
        id: `order-${order.id}-${Date.now()}`,
        type: 'order',
        title: 'Order Updated',
        message: `Order #${order.id.slice(-8)} status changed to ${order.status}`,
        data: { orderId: order.id },
        read: false,
        createdAt: new Date().toISOString(),
      }))
    })

    // Shipment events
    socket.on('shipment:updated', (shipment) => {
      dispatch(addNotification({
        id: `shipment-${shipment.id}-${Date.now()}`,
        type: 'order',
        title: 'Shipment Updated',
        message: `Your shipment status changed to ${shipment.status}`,
        data: { shipmentId: shipment.id },
        read: false,
        createdAt: new Date().toISOString(),
      }))
    })

    // General notifications
    socket.on('notification', (notification) => {
      dispatch(addNotification(notification))
    })

  }, [dispatch, accessToken])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      dispatch(setConnectionStatus(false))
    }
  }, [dispatch])

  const emit = useCallback(<K extends keyof SocketEmits>(
    event: K,
    data: Parameters<SocketEmits[K]>[0]
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K]
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler as any)
    }
  }, [])

  const off = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler?: SocketEvents[K]
  ) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler as any)
      } else {
        socketRef.current.off(event)
      }
    }
  }, [])

  useEffect(() => {
    if (accessToken && !isConnected) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [accessToken, isConnected, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  }
}
