import api from './api'
import { Conversation, Message, SendMessageRequest } from '@/types'

export interface GetConversationsParams {
  page?: number
  limit?: number
  status?: string
  sortBy?: 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetConversationsResponse {
  conversations: Conversation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetMessagesParams {
  page?: number
  limit?: number
  before?: string
  after?: string
}

export interface GetMessagesResponse {
  messages: Message[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export const chatService = {
  // Get conversations
  async getConversations(params: GetConversationsParams = {}): Promise<GetConversationsResponse> {
    const response = await api.get('/chat/conversations', { params })
    return response.data
  },

  // Get single conversation
  async getConversation(id: string): Promise<Conversation> {
    const response = await api.get(`/chat/conversations/${id}`)
    return response.data
  },

  // Create conversation
  async createConversation(participantId: string): Promise<Conversation> {
    const response = await api.post('/chat/conversations', { participantId })
    return response.data
  },

  // Get conversation messages
  async getMessages(conversationId: string, params: GetMessagesParams = {}): Promise<GetMessagesResponse> {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params })
    return response.data
  },

  // Send message
  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<Message> {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, data)
    return response.data
  },

  // Update message
  async updateMessage(conversationId: string, messageId: string, data: Partial<Message>): Promise<Message> {
    const response = await api.patch(`/chat/conversations/${conversationId}/messages/${messageId}`, data)
    return response.data
  },

  // Delete message
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`)
  },

  // Mark messages as read
  async markAsRead(conversationId: string, messageId?: string): Promise<void> {
    await api.post(`/chat/conversations/${conversationId}/read`, { messageId })
  },

  // Report message
  async reportMessage(conversationId: string, messageId: string, reason: string, description?: string): Promise<void> {
    await api.post(`/chat/conversations/${conversationId}/messages/${messageId}/report`, {
      reason,
      description
    })
  },

  // Upload attachment
  async uploadAttachment(conversationId: string, file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`/chat/conversations/${conversationId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Get ICE servers for WebRTC
  async getIceServers(): Promise<{ iceServers: any[] }> {
    const response = await api.get('/chat/ice-servers')
    return response.data
  },

  // Start video call
  async startVideoCall(conversationId: string): Promise<{ callId: string }> {
    const response = await api.post(`/chat/conversations/${conversationId}/video-call`)
    return response.data
  },

  // End video call
  async endVideoCall(conversationId: string, callId: string): Promise<void> {
    await api.post(`/chat/conversations/${conversationId}/video-call/${callId}/end`)
  }
}
