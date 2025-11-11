import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '@/lib/api';

export interface Message {
  id: string;
  conversationId: string;
  senderRole: 'BUYER' | 'MERCHANT';
  senderUserId?: string;
  senderMerchantId?: string;
  type: 'TEXT' | 'SIGNAL';
  content?: string;
  attachments?: string[];
  readAt?: string;
  createdAt: string;
  senderUser?: any;
  senderMerchant?: any;
}

export interface Conversation {
  id: string;
  userId: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
  merchant?: any;
  messages?: Message[];
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    const response = await chatApi.getConversations();
    return response.data;
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (merchantId: string) => {
    const response = await chatApi.createConversation(merchantId);
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string) => {
    const response = await chatApi.getMessages(conversationId);
    const messages = (response.data as any)?.data || response.data;
    return { conversationId, messages: Array.isArray(messages) ? messages : [] };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, type = 'TEXT', attachments = [] }: {
    conversationId: string;
    content?: string;
    type?: 'TEXT' | 'SIGNAL';
    attachments?: string[];
  }) => {
    const response = await chatApi.sendMessage(conversationId, { content, type, attachments });
    return response.data;
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
    await chatApi.markAsRead(conversationId, messageId);
    return { conversationId, messageId };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      
      // Ensure conversation exists in messages map
      if (!state.messages[message.conversationId]) {
        state.messages[message.conversationId] = [];
      }
      
      // Check if message already exists (prevent duplicates)
      const existingIndex = state.messages[message.conversationId].findIndex(m => m.id === message.id);
      if (existingIndex === -1) {
        // Add new message
        state.messages[message.conversationId].push(message);
        // Sort by createdAt
        state.messages[message.conversationId].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else {
        // Update existing message (in case it was optimistic and now has real data)
        state.messages[message.conversationId][existingIndex] = message;
      }
      
      // Update conversation updatedAt and ensure it exists
      let conversation = state.conversations.find(c => c.id === message.conversationId);
      if (!conversation) {
        // Create a minimal conversation object if it doesn't exist
        // This will be populated with full details when conversations are refreshed
        conversation = {
          id: message.conversationId,
          userId: message.senderUserId || '',
          merchantId: message.senderMerchantId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: message.senderUser || undefined,
          merchant: message.senderMerchant || undefined,
          messages: [message], // Include the message in the conversation preview
        };
        state.conversations.unshift(conversation); // Add to beginning
      } else {
        conversation.updatedAt = new Date().toISOString();
        // Update last message preview
        if (!conversation.messages || conversation.messages.length === 0) {
          conversation.messages = [message];
        } else {
          conversation.messages[0] = message; // Update last message
        }
      }
      
      // Re-sort conversations by updatedAt (most recent first)
      state.conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    refreshConversations: (state) => {
      // This action will trigger a fetch - handled by extraReducers
      state.isLoading = true;
    },
    updateMessageRead: (state, action: PayloadAction<{ messageId: string; conversationId: string; readAt: string }>) => {
      const { messageId, conversationId, readAt } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.readAt = readAt;
        }
        // Mark all previous messages as read
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          for (let i = 0; i <= messageIndex; i++) {
            if (!messages[i].readAt) {
              messages[i].readAt = readAt;
            }
          }
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        
        // Backend returns: { data: conversations[] }
        // After axios response.data: { data: conversations[] }
        // After thunk return response.data: { data: conversations[] }
        let conversations: any[] = [];
        
        if (payload) {
          if (Array.isArray(payload)) {
            conversations = payload;
          } else if (payload.data && Array.isArray(payload.data)) {
            conversations = payload.data;
          } else if (typeof payload === 'object') {
            // Try to find conversations array in the payload
            const payloadData = (payload as any).data;
            if (Array.isArray(payloadData)) {
              conversations = payloadData;
            }
          }
        }
        
        console.log('[chatSlice] Fetched conversations:', {
          payloadType: typeof payload,
          payloadIsArray: Array.isArray(payload),
          payloadKeys: payload ? Object.keys(payload) : [],
          payloadValue: payload,
          conversationsCount: conversations.length,
          conversations: conversations.length > 0 ? conversations.slice(0, 2) : []
        });
        
        state.conversations = conversations;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        const conversation = (action.payload as any)?.data || action.payload;
        if (conversation && conversation.id) {
          const exists = state.conversations.find(c => c.id === conversation.id);
          if (!exists) {
            state.conversations.unshift(conversation);
          }
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create conversation';
      })
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = (action.payload as any)?.data || action.payload;
        const conversationId = payload?.conversationId || (action.payload as any).conversationId;
        const messagesData = payload?.messages || (action.payload as any).messages || payload;
        if (conversationId) {
          state.messages[conversationId] = Array.isArray(messagesData) ? messagesData : [];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = (action.payload as any)?.data || action.payload;
        if (message && message.conversationId) {
          if (!state.messages[message.conversationId]) {
            state.messages[message.conversationId] = [];
          }
          const exists = state.messages[message.conversationId].some(m => m.id === message.id);
          if (!exists) {
            state.messages[message.conversationId].push(message);
            state.messages[message.conversationId].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
        }
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        const messages = state.messages[conversationId];
        if (messages) {
          const message = messages.find(m => m.id === messageId);
          if (message) {
            message.readAt = new Date().toISOString();
          }
        }
      });
  },
});

export const { setActiveConversation, addMessage, updateMessageRead, clearError } = chatSlice.actions;
export default chatSlice.reducer;

