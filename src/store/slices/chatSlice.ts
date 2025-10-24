import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ChatState, Conversation, Message, SendMessageRequest } from '@/types'
import { chatApi } from '@/lib/api'

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  isConnected: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApi.getConversations()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations')
    }
  }
)

export const getOrCreateConversation = createAsyncThunk(
  'chat/getOrCreateConversation',
  async (merchantId: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.getOrCreateConversation(merchantId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get or create conversation')
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await chatApi.getMessages(conversationId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage(conversationId, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

export const markMessageAsRead = createAsyncThunk(
  'chat/markMessageAsRead',
  async ({ conversationId, latestMessageId }: { conversationId: string; latestMessageId: string }, { rejectWithValue }) => {
    try {
      await chatApi.markRead(conversationId, latestMessageId)
      return { conversationId, latestMessageId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read')
    }
  }
)

export const reportMessage = createAsyncThunk(
  'chat/reportMessage',
  async ({ messageId, reason }: { messageId: string; reason: string }, { rejectWithValue }) => {
    try {
      await chatApi.reportMessage(messageId, reason)
      return { messageId, reason }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report message')
    }
  }
)

export const uploadAttachments = createAsyncThunk(
  'chat/uploadAttachments',
  async ({ conversationId, files }: { conversationId: string; files: File[] }, { rejectWithValue }) => {
    try {
      const response = await chatApi.uploadAttachments(conversationId, files)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload attachments')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Check if message already exists
      const existingMessage = state.messages.find(m => m.id === action.payload.id)
      if (!existingMessage) {
        state.messages.push(action.payload)
        // Update unread count if message is from someone else
        if (action.payload.senderRole === 'MERCHANT') {
          state.unreadCount += 1
        }
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.messages[index] = action.payload
      }
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    clearMessages: (state) => {
      state.messages = []
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload
    },
    // Optimistic updates
    addMessageOptimistic: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    updateConversationOptimistic: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.conversations[index] = action.payload
      } else {
        state.conversations.unshift(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false
        state.conversations = action.payload.data || []
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Get or Create Conversation
      .addCase(getOrCreateConversation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        state.isLoading = false
        state.activeConversation = action.payload.data
        // Add to conversations if not already present
        const existingIndex = state.conversations.findIndex(c => c.id === action.payload.data.id)
        if (existingIndex === -1) {
          state.conversations.unshift(action.payload.data)
        }
      })
      .addCase(getOrCreateConversation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false
        state.messages = action.payload.data || []
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false
        // Message is added via WebSocket, no need to add here
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Mark Message as Read
      .addCase(markMessageAsRead.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        state.isLoading = false
        // Update message read status
        const message = state.messages.find(m => m.id === action.payload.latestMessageId)
        if (message) {
          message.readAt = new Date().toISOString()
        }
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Report Message
      .addCase(reportMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(reportMessage.fulfilled, (state, action) => {
        state.isLoading = false
        // Message reported successfully
      })
      .addCase(reportMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Upload Attachments
      .addCase(uploadAttachments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        state.isLoading = false
        // Attachments uploaded successfully
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setActiveConversation,
  addMessage,
  updateMessage,
  setConnectionStatus,
  clearMessages,
  updateUnreadCount,
  addMessageOptimistic,
  updateConversationOptimistic,
} = chatSlice.actions

export default chatSlice.reducer
