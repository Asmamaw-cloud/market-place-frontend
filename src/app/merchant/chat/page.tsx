'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MessageCircle, 
  Search, 
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, getRelativeTime } from '@/lib/utils'
import { MessageType } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

// Mock data - in a real app, this would come from the API
const mockConversations = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'John Doe',
      phone: '+251900000001'
    },
    lastMessage: {
      content: 'When will my order be delivered?',
      createdAt: '2024-01-15T10:30:00Z',
      senderRole: 'BUYER' as const
    },
    unreadCount: 1,
    updatedAt: '2024-01-15T10:30:00Z',
    orderId: 'ORD-123456'
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Jane Smith',
      phone: '+251900000002'
    },
    lastMessage: {
      content: 'Thank you for the quick delivery!',
      createdAt: '2024-01-14T15:20:00Z',
      senderRole: 'BUYER' as const
    },
    unreadCount: 0,
    updatedAt: '2024-01-14T15:20:00Z',
    orderId: 'ORD-123455'
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'Mike Johnson',
      phone: '+251900000003'
    },
    lastMessage: {
      content: 'Is this product available in different sizes?',
      createdAt: '2024-01-13T09:15:00Z',
      senderRole: 'BUYER' as const
    },
    unreadCount: 2,
    updatedAt: '2024-01-13T09:15:00Z'
  }
]

export default function MerchantChatPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  const { 
    conversations: chatConversations, 
    isLoading, 
    loadConversations 
  } = useChat()
  const { isAuthenticated, isMerchant } = useAuth()

  useEffect(() => {
    if (isAuthenticated && isMerchant) {
      loadConversations()
    }
  }, [isAuthenticated, isMerchant, loadConversations])

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.phone.includes(searchQuery)
  )

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to access chat
            </p>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              This page is only accessible to merchants
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Messages</h1>
          <p className="text-muted-foreground">
            Chat with your customers about their orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Customers</CardTitle>
                  <Badge variant="secondary">
                    {conversations.filter(c => c.unreadCount > 0).length} unread
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No customers found' : 'No conversations yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`
                          flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted transition-colors
                          ${selectedConversation === conversation.id ? 'bg-muted' : ''}
                        `}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {conversation.user.name.charAt(0)}
                            </span>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getRelativeTime(conversation.updatedAt)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.orderId && (
                            <p className="text-xs text-blue-600">
                              Order #{conversation.orderId.slice(-6)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <MerchantChatInterface conversationId={selectedConversation} />
            ) : (
              <Card className="h-96">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Customer</h3>
                    <p className="text-muted-foreground">
                      Choose a customer from the list to start chatting
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function MerchantChatInterface({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const { 
    messages, 
    loadMessages, 
    sendMessage, 
    emitMessage,
    emitTyping,
    isConnected 
  } = useChat()

  useEffect(() => {
    loadMessages(conversationId)
  }, [conversationId, loadMessages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const messageContent = message.trim()
    setMessage('')
    
    // Send via WebSocket
    emitMessage(conversationId, messageContent, MessageType.TEXT, [])
    
    // Also send via API
    await sendMessage(conversationId, messageContent, MessageType.TEXT, [])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true)
      emitTyping(conversationId, true)
    } else if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false)
      emitTyping(conversationId, false)
    }
  }

  return (
    <Card className="h-96 flex flex-col">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">C</span>
            </div>
            <div>
              <p className="font-medium">Customer Name</p>
              <p className="text-xs text-muted-foreground">
                Order #123456 • {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderRole === 'MERCHANT' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs px-3 py-2 rounded-lg text-sm
                    ${msg.senderRole === 'MERCHANT' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                    }
                  `}
                >
                  <p>{msg.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                      msg.senderRole === 'MERCHANT' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatDate(msg.createdAt)}
                    </p>
                    {msg.senderRole === 'MERCHANT' && (
                      <div className="flex items-center space-x-1">
                        {msg.readAt ? (
                          <CheckCircle className="h-3 w-3 text-blue-400" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
