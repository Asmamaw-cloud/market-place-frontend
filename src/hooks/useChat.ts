import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
  markAsRead,
  setActiveConversation,
  addMessage,
} from '@/store/slices/chatSlice';
import type { Message } from '@/store/slices/chatSlice';
import { usePusher } from './usePusher';
import { useAuth } from './useAuth';

export const useChat = () => {
  const dispatch = useAppDispatch();
  const { 
    pusher, 
    isConnected, 
    subscribeToConversation, 
    unsubscribeFromConversation 
  } = usePusher();
  const { user } = useAuth();
  
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
  } = useAppSelector((state: any) => state.chat);

  // Load conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Subscribe to active conversation channel when it changes
  useEffect(() => {
    if (!isConnected || !activeConversationId) {
      return;
    }

    subscribeToConversation(activeConversationId);
    console.log('[useChat] Subscribed to conversation:', activeConversationId);

    return () => {
      unsubscribeFromConversation(activeConversationId);
    };
  }, [isConnected, activeConversationId, subscribeToConversation, unsubscribeFromConversation]);

  // Listen for new conversation events via window events (triggered by usePusher)
  useEffect(() => {
    if (!isConnected || !user) return;

    const handlePusherNewConversation = (event: CustomEvent) => {
      console.log('[useChat] New conversation event received:', event.detail);
      // Refresh conversations list to show the new conversation
            dispatch(fetchConversations());
    };

    window.addEventListener('pusher:new-conversation', handlePusherNewConversation as EventListener);

    return () => {
      window.removeEventListener('pusher:new-conversation', handlePusherNewConversation as EventListener);
    };
  }, [isConnected, user, dispatch]);

  const loadConversations = useCallback(() => {
    return dispatch(fetchConversations());
  }, [dispatch]);

  const createOrGetConversation = useCallback(
    (merchantId: string) => {
      return dispatch(createConversation(merchantId));
    },
    [dispatch]
  );

  const loadMessages = useCallback(
    (conversationId: string) => {
      return dispatch(fetchMessages(conversationId));
    },
    [dispatch]
  );

  const sendChatMessage = useCallback(
    async (
      conversationId: string,
      content: string,
      type: 'TEXT' | 'SIGNAL' = 'TEXT',
      attachments: string[] = []
    ) => {
      // Always use REST API - Pusher will broadcast the message in real-time
        return dispatch(
          sendMessage({
            conversationId,
            content,
            type,
            attachments,
          })
        );
    },
    [dispatch]
  );

  const markAsReadMessage = useCallback(
    (conversationId: string, messageId: string) => {
      // Always use REST API - Pusher will broadcast read receipt in real-time
        return dispatch(markAsRead({ conversationId, messageId }));
    },
    [dispatch]
  );

  const sendTypingIndicator = useCallback(
    (conversationId: string) => {
      // Typing indicators can be added later via Pusher if needed
      // For now, we'll skip this to keep it simple
    },
    []
  );

  const setActiveConv = useCallback(
    (conversationId: string | null) => {
      dispatch(setActiveConversation(conversationId));
      if (conversationId) {
        subscribeToConversation(conversationId);
        loadMessages(conversationId);
      }
    },
    [dispatch, subscribeToConversation, loadMessages]
  );

  const joinConversation = useCallback(
    (conversationId: string) => {
      if (isConnected) {
        subscribeToConversation(conversationId);
      }
    },
    [isConnected, subscribeToConversation]
  );

  const getMessagesForConversation = useCallback(
    (conversationId: string) => {
      return messages[conversationId] || [];
    },
    [messages]
  );

  // Calculate unread count
  const unreadCount = useMemo(() => {
    let count = 0;
    for (const convId in messages) {
      const convMessages = messages[convId];
      const conversation = conversations.find((c: any) => c.id === convId);
      if (conversation) {
        const userRole = (user as any)?.role;
        const targetRole = userRole === 'MERCHANT' ? 'BUYER' : 'MERCHANT';
        count += convMessages.filter((m: any) => 
          m.senderRole === targetRole && !m.readAt
        ).length;
      }
    }
    return count;
  }, [messages, conversations, user]);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    isConnected,
    pusher,
    unreadCount,
    loadConversations,
    createOrGetConversation,
    loadMessages,
    sendMessage: sendChatMessage,
    markAsRead: markAsReadMessage,
    setActiveConversation: setActiveConv,
    joinConversation,
    sendTypingIndicator,
    getMessagesForConversation,
  };
};

