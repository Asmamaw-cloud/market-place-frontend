import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchConversations,
  getOrCreateConversation,
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  reportMessage,
  uploadAttachments,
  setActiveConversation,
  addMessage,
  clearError,
  clearMessages,
} from '@/store/slices/chatSlice'
import { useSocket } from './useSocket'
import { MessageType } from '@/types'

export const useChat = () => {
  const dispatch = useAppDispatch()
  const { socket, emit } = useSocket()
  const {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    isConnected,
    isLoading,
    error,
  } = useAppSelector(state => state.chat)

  const loadConversations = useCallback(() => {
    return dispatch(fetchConversations())
  }, [dispatch])

  const createOrGetConversation = useCallback(
    (merchantId: string) => {
      return dispatch(getOrCreateConversation(merchantId))
    },
    [dispatch]
  )

  const loadMessages = useCallback(
    (conversationId: string) => {
      return dispatch(fetchMessages(conversationId))
    },
    [dispatch]
  )

  const sendChatMessage = useCallback(
    (conversationId: string, content: string, type: MessageType = MessageType.TEXT, attachments: string[] = []) => {
      return dispatch(sendMessage({
        conversationId,
        data: { conversationId, content, type, attachments }
      }))
    },
    [dispatch]
  )

  const markAsRead = useCallback(
    (conversationId: string, latestMessageId: string) => {
      return dispatch(markMessageAsRead({ conversationId, latestMessageId }))
    },
    [dispatch]
  )

  const reportChatMessage = useCallback(
    (messageId: string, reason: string) => {
      return dispatch(reportMessage({ messageId, reason }))
    },
    [dispatch]
  )

  const uploadChatAttachments = useCallback(
    (conversationId: string, files: File[]) => {
      return dispatch(uploadAttachments({ conversationId, files }))
    },
    [dispatch]
  )

  const setActiveConv = useCallback(
    (conversation: any) => {
      dispatch(setActiveConversation(conversation))
    },
    [dispatch]
  )

  const clearErrorState = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const clearChatMessages = useCallback(() => {
    dispatch(clearMessages())
  }, [dispatch])

  // WebSocket event handlers
  const handleNewMessage = useCallback(
    (message: any) => {
      dispatch(addMessage(message))
    },
    [dispatch]
  )

  const handleMessageRead = useCallback(
    (data: { messageId: string; readAt: string }) => {
      // Update message read status
      const message = messages.find(m => m.id === data.messageId)
      if (message) {
        message.readAt = data.readAt
      }
    },
    [messages]
  )

  const handleTyping = useCallback(
    (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      // Handle typing indicator
      console.log('User typing:', data)
    },
    []
  )

  // Set up WebSocket listeners
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('message', handleNewMessage)
      socket.on('message:read', handleMessageRead)
      socket.on('typing', handleTyping)

      return () => {
        socket.off('message', handleNewMessage)
        socket.off('message:read', handleMessageRead)
        socket.off('typing', handleTyping)
      }
    }
  }, [socket, isConnected, handleNewMessage, handleMessageRead, handleTyping])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // WebSocket emit functions
  const emitMessage = useCallback(
    (conversationId: string, content: string, type: MessageType = MessageType.TEXT, attachments: string[] = []) => {
      emit('message:send', { conversationId, content, type, attachments })
    },
    [emit]
  )

  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      emit('typing', { conversationId, isTyping })
    },
    [emit]
  )

  const emitJoinConversation = useCallback(
    (conversationId: string) => {
      emit('join:conversation', conversationId)
    },
    [emit]
  )

  const emitLeaveConversation = useCallback(
    (conversationId: string) => {
      emit('leave:conversation', conversationId)
    },
    [emit]
  )

  const emitMarkRead = useCallback(
    (messageId: string) => {
      emit('message:read', { messageId })
    },
    [emit]
  )

  // Helper functions
  const getConversationById = useCallback(
    (conversationId: string) => {
      return conversations.find(c => c.id === conversationId)
    },
    [conversations]
  )

  const getMessagesByConversation = useCallback(
    (conversationId: string) => {
      return messages.filter(m => m.conversationId === conversationId)
    },
    [messages]
  )

  const getUnreadCountByConversation = useCallback(
    (conversationId: string) => {
      return messages.filter(m => 
        m.conversationId === conversationId && 
        !m.readAt && 
        m.senderRole === 'MERCHANT'
      ).length
    },
    [messages]
  )

  return {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    isConnected,
    isLoading,
    error,
    loadConversations,
    createOrGetConversation,
    loadMessages,
    sendMessage: sendChatMessage,
    markAsRead,
    reportMessage: reportChatMessage,
    uploadAttachments: uploadChatAttachments,
    setActiveConversation: setActiveConv,
    clearError: clearErrorState,
    clearMessages: clearChatMessages,
    emitMessage,
    emitTyping,
    emitJoinConversation,
    emitLeaveConversation,
    emitMarkRead,
    getConversationById,
    getMessagesByConversation,
    getUnreadCountByConversation,
  }
}
