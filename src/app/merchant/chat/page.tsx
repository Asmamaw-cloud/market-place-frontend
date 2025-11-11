'use client';

import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, Search } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime, getRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function MerchantChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isMerchant } = useAuth();
  const { conversations, isLoading, loadConversations, setActiveConversation, isConnected } = useChat();

  useEffect(() => {
    if (isAuthenticated && isMerchant) {
      loadConversations();
    }
  }, [isAuthenticated, isMerchant, loadConversations]);

  // Listen for new conversation events via Pusher to refresh conversations
  useEffect(() => {
    if (!isAuthenticated || !isMerchant || !isConnected) return;

    const handlePusherNewConversation = () => {
      console.log('[MerchantChatPage] Pusher new conversation event received, refreshing conversations');
      loadConversations();
    };

    window.addEventListener('pusher:new-conversation', handlePusherNewConversation);

    return () => {
      window.removeEventListener('pusher:new-conversation', handlePusherNewConversation);
    };
  }, [isAuthenticated, isMerchant, isConnected, loadConversations]);

  const filteredConversations = conversations.filter((conv: any) => {
    const userName = conv.user?.name || conv.user?.email || 'Unknown User';
    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Login</h1>
          <Link href="/login">
            <Button>Login to Continue</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">This page is only accessible to merchants</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Messages</h1>
          <p className="text-muted-foreground">Chat with your customers about their orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg mb-2">Customers</CardTitle>
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
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conv: any) => {
                      const lastMessage = conv.messages?.[0];
                      const unreadCount = lastMessage && !lastMessage.readAt && lastMessage.senderRole === 'BUYER' ? 1 : 0;
                      const userName = conv.user?.name || conv.user?.email || 'Unknown User';
                      return (
                        <div
                          key={conv.id}
                          className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => setActiveConversation(conv.id)}
                        >
                          <div className="relative">
                            {conv.user?.avatarUrl ? (
                              <Image src={conv.user.avatarUrl} alt={userName} width={40} height={40} className="rounded-full" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
                              </div>
                            )}
                            {unreadCount > 0 && (
                              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">{userName}</p>
                              {conv.updatedAt && (
                                <p className="text-xs text-muted-foreground">
                                  {getRelativeTime(conv.updatedAt)}
                                </p>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-xs text-muted-foreground truncate">
                                {lastMessage.content || 'No message'}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <MerchantChatInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function MerchantChatInterface() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeConversationId, conversations, getMessagesForConversation, sendMessage, isConnected, markAsRead, joinConversation } = useChat();
  const { user } = useAuth();

  const conversation = conversations.find((c: any) => c.id === activeConversationId);
  const conversationMessages = activeConversationId ? getMessagesForConversation(activeConversationId) : [];

  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
    }
  }, [activeConversationId, joinConversation]);

  useEffect(() => {
    if (conversationMessages.length > 0 && activeConversationId) {
      const lastUnread = [...conversationMessages]
        .reverse()
        .find((m: any) => m.senderRole === 'BUYER' && !m.readAt);
      if (lastUnread) {
        markAsRead(activeConversationId, lastUnread.id);
      }
    }
  }, [conversationMessages, activeConversationId, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSend = async () => {
    if (!message.trim() || !activeConversationId) return;
    await sendMessage(activeConversationId, message.trim());
    setMessage('');
  };

  if (!activeConversationId) {
    return (
      <Card className="h-[calc(100vh-12rem)]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Customer</h3>
            <p className="text-muted-foreground">Choose a customer from the list to start chatting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const customer = conversation?.user;
  const isSender = (msg: any) => msg.senderRole === 'MERCHANT';

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center space-x-3">
          {customer?.avatarUrl ? (
            <Image src={customer.avatarUrl} alt={customer.name || customer.email} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">
                {(customer?.name || customer?.email || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium">{customer?.name || customer?.email || 'Customer'}</p>
            <div className="flex items-center gap-2">
              <p className={`text-xs ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Connecting...
                  </span>
                )}
            </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-y-auto">
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversationMessages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${isSender(msg) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    isSender(msg)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content && <p>{msg.content}</p>}
                  <p className={`text-xs mt-1 ${
                    isSender(msg) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatDateTime(msg.createdAt)}
                    {msg.readAt && isSender(msg) && <span className="ml-1">✓✓</span>}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}


