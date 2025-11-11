import { useEffect, useRef, useCallback, useState } from 'react';
import Pusher from 'pusher-js';
import { useAppDispatch, useAppSelector } from './redux';
import { addMessage, updateMessageRead } from '@/store/slices/chatSlice';
import { useAuth } from './useAuth';

export const usePusher = () => {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector(state => state.auth);
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);
  const channelsRef = useRef<Map<string, any>>(new Map());

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (pusherRef.current || !accessToken || !user) {
      return;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

    if (!pusherKey) {
      console.warn('Cannot connect Pusher: No PUSHER_KEY configured');
      return;
    }

    // Remove /api suffix if present since we're already in /api base
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Ensure we don't double the /api prefix
    if (apiUrl.endsWith('/api')) {
      apiUrl = apiUrl.replace(/\/api$/, '');
    }
    const authEndpoint = `${apiUrl}/api/chat/pusher-auth`;
    
    console.log('[Pusher] Connecting...', {
      cluster: pusherCluster,
      authEndpoint,
      originalApiUrl: process.env.NEXT_PUBLIC_API_URL,
      hasAccessToken: !!accessToken,
    });

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      enabledTransports: ['ws', 'wss'],
    });

    pusherRef.current = pusher;

    pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully');
      setIsConnected(true);
    });

    pusher.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
      setIsConnected(false);
    });

    pusher.connection.bind('error', (error: any) => {
      console.error('❌ Pusher connection error:', error);
      setIsConnected(false);
    });

    // Subscribe to user's private channel for notifications
    if (user?.id) {
      const userChannelName = `private-user-${user.id}`;
      console.log(`[Pusher] Subscribing to user channel: ${userChannelName}`);
      
      const userChannel = pusher.subscribe(userChannelName);
      channelsRef.current.set(userChannelName, userChannel);

      userChannel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ Successfully subscribed to user channel: ${userChannelName}`);
      });

      userChannel.bind('pusher:subscription_error', (status: number) => {
        console.error(`❌ Failed to subscribe to user channel ${userChannelName}: HTTP ${status}`);
        if (status === 403) {
          console.error('Access denied - check if user ID matches the channel');
        }
      });

      // Create stable handler functions to prevent duplicate bindings
      const newMessageHandler = (data: any) => {
        console.log('[Pusher] New message received on user channel:', data);
        // Only dispatch if we're not already subscribed to the conversation channel
        // This prevents duplicate messages when user has the conversation open
        if (data && data.id && data.conversationId) {
          const conversationChannelName = `private-conversation-${data.conversationId}`;
          const conversationChannel = channelsRef.current.get(conversationChannelName);
          const isSubscribedToConversation = conversationChannel && conversationChannel.subscribed;
          
          if (!isSubscribedToConversation) {
            console.log('[Pusher] ✅ Dispatching addMessage action (not subscribed to conversation channel)');
            dispatch(addMessage(data));
          } else {
            console.log('[Pusher] ⏭️ Skipping user channel message - already subscribed to conversation channel');
          }
        } else {
          console.warn('[Pusher] ⚠️ Invalid message data received:', data);
        }
      };

      const newConversationHandler = (data: any) => {
        console.log('[Pusher] New conversation created:', data);
        // Trigger a custom event that useChat can listen to
        window.dispatchEvent(new CustomEvent('pusher:new-conversation', { 
          detail: data 
        }));
      };
      
      // Unbind existing handlers first to prevent duplicates
      userChannel.unbind('new-message', newMessageHandler);
      userChannel.unbind('new-conversation', newConversationHandler);
      
      // Bind handlers
      userChannel.bind('new-message', newMessageHandler);
      userChannel.bind('new-conversation', newConversationHandler);
    } else {
      console.warn('[Pusher] ⚠️ Cannot subscribe to user channel: user.id is missing');
    }
  }, [dispatch, accessToken, user]);

  const subscribeToConversation = useCallback((conversationId: string) => {
    if (!pusherRef.current || !conversationId) return;

    const channelName = `private-conversation-${conversationId}`;
    
    // Already subscribed - check if channel exists and is subscribed
    const existingChannel = channelsRef.current.get(channelName);
    if (existingChannel && existingChannel.subscribed) {
      console.log(`[Pusher] Already subscribed to conversation: ${conversationId}`);
      return;
    }

    try {
      console.log(`[Pusher] Attempting to subscribe to channel: ${channelName}`);
      
      // Unsubscribe if exists but not subscribed
      if (existingChannel) {
        pusherRef.current.unsubscribe(channelName);
        channelsRef.current.delete(channelName);
      }
      
      const channel = pusherRef.current.subscribe(channelName);
      channelsRef.current.set(channelName, channel);

      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ Subscribed to conversation: ${conversationId}`);
      });

      channel.bind('pusher:subscription_error', (error: any) => {
        // Pusher subscription_error can pass either a number (status) or an object
        console.error(`❌ Failed to subscribe to conversation ${conversationId}`);
        
        // Extract status code - could be number directly or in error object
        const status = typeof error === 'number' ? error : (error?.status || error?.code || 'unknown');
        const errorMessage = typeof error === 'object' ? (error.message || error.error || JSON.stringify(error)) : '';
        
        console.error('Error details:', {
          status,
          error,
          errorType: typeof error,
          errorString: JSON.stringify(error),
        });
        
        console.error('This usually means the auth endpoint returned an error or access was denied');
        console.error('Check backend logs for detailed error messages starting with [Pusher Auth]');
        
        // Status codes:
        // 401 = Unauthorized (not authenticated)
        // 403 = Forbidden (no access)
        // 400 = Bad Request (invalid request)
        // 500 = Internal Server Error
        
        if (status === 401 || status === '401') {
          console.error('❌ Authentication failed - check if JWT token is valid and not expired');
          console.error('   Solution: Check that the Authorization header is being sent correctly');
        } else if (status === 403 || status === '403') {
          console.error('❌ Access denied - user may not have permission for this conversation');
          console.error('   Check if:');
          console.error('   1. User is part of this conversation');
          console.error('   2. Merchant ownerId matches user userId');
          console.error('   3. Conversation exists in database');
          console.error('   4. Check backend logs for [Pusher Auth] messages');
        } else if (status === 400 || status === '400') {
          console.error('❌ Bad request - check channel name format');
        } else if (status === 500 || status === '500') {
          console.error('❌ Internal server error - check backend logs');
        } else {
          console.error(`❌ Unknown error status: ${status}`);
          if (errorMessage) {
            console.error(`   Error message: ${errorMessage}`);
          }
        }
      });

      // Store handler reference to prevent duplicates
      const handlerKey = `message-${conversationId}`;
      const existingHandler = (channel as any)._handlers?.callbacks?.['message'];
      
      // Listen for messages - this is the primary channel for active conversations
      const messageHandler = (data: any) => {
        console.log('[Pusher] Message received on conversation channel:', data);
        if (data && data.id && data.conversationId) {
          console.log('[Pusher] ✅ Dispatching addMessage action from conversation channel');
          dispatch(addMessage(data));
        } else {
          console.warn('[Pusher] ⚠️ Invalid message data from conversation channel:', data);
        }
      };
      
      // Unbind all message handlers first to prevent duplicates
      channel.unbind('message');
      channel.bind('message', messageHandler);
      
      // Store handler for cleanup
      (channel as any)._messageHandler = messageHandler;

      // Listen for read receipts
      channel.bind('message-read', (data: any) => {
        console.log('[Pusher] Message read receipt:', data);
        if (data.messageId && data.conversationId) {
          dispatch(updateMessageRead({
            messageId: data.messageId,
            conversationId: data.conversationId,
            readAt: data.readAt || new Date().toISOString(),
          }));
        }
      });
    } catch (error) {
      console.error(`Failed to subscribe to conversation ${conversationId}:`, error);
    }
  }, [dispatch]);

  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    if (!pusherRef.current) return;

    const channelName = `private-conversation-${conversationId}`;
    const channel = channelsRef.current.get(channelName);
    
    if (channel) {
      pusherRef.current.unsubscribe(channelName);
      channelsRef.current.delete(channelName);
      console.log(`Unsubscribed from conversation: ${conversationId}`);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (pusherRef.current) {
      channelsRef.current.forEach((channel, channelName) => {
        pusherRef.current?.unsubscribe(channelName);
      });
      channelsRef.current.clear();
      pusherRef.current.disconnect();
      pusherRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken && user && !pusherRef.current) {
      connect();
    }

    return () => {
      if (!accessToken) {
        disconnect();
      }
    };
  }, [accessToken, user, connect, disconnect]);

  return {
    pusher: pusherRef.current,
    isConnected,
    connect,
    disconnect,
    subscribeToConversation,
    unsubscribeFromConversation,
  };
};

