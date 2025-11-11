'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, Search, Plus } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime, getRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useMerchants } from '@/hooks/useMerchants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantId = searchParams.get('merchantId');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useAuth();
  const { conversations, isLoading, loadConversations, createOrGetConversation, setActiveConversation } = useChat();

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  useEffect(() => {
    if (merchantId && isAuthenticated) {
      createOrGetConversation(merchantId).then((result: any) => {
        const conversation = (result.payload as any)?.data || result.payload;
        if (conversation) {
          setActiveConversation(conversation.id);
          router.replace('/chat');
        }
      });
    }
  }, [merchantId, isAuthenticated]);

  const filteredConversations = conversations.filter((conv: any) => {
    const merchantName = conv.merchant?.displayName || '';
    return merchantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Login</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access chat</p>
          <Link href="/login">
            <Button>Login to Continue</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Chat with merchants about your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <NewConversationDialog onCreated={(conv) => {
                    setActiveConversation(conv.id);
                    router.replace('/chat');
                  }} />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
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
                      const unreadCount = lastMessage && !lastMessage.readAt && lastMessage.senderRole === 'MERCHANT' ? 1 : 0;
                      return (
                        <div
                          key={conv.id}
                          className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => setActiveConversation(conv.id)}
                        >
                          <div className="relative">
                            {conv.merchant?.logoUrl ? (
                              <Image
                                src={conv.merchant.logoUrl}
                                alt={conv.merchant.displayName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {conv.merchant?.displayName?.charAt(0) || 'M'}
                                </span>
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
                              <p className="font-medium text-sm truncate">
                                {conv.merchant?.displayName || 'Merchant'}
                              </p>
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
            <ChatInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function NewConversationDialog({ onCreated }: { onCreated: (conv: any) => void }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { merchants, isLoading, loadMerchants } = useMerchants();
  const { createOrGetConversation } = useChat();

  useEffect(() => {
    if (open) {
      loadMerchants({ search: searchQuery });
    }
  }, [open, searchQuery, loadMerchants]);

  const handleSelect = async (merchantId: string) => {
    const result = await createOrGetConversation(merchantId);
    const conversation = (result.payload as any)?.data || result.payload;
    if (conversation) {
      onCreated(conversation);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search merchants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : merchants.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No merchants found</p>
          ) : (
            merchants.map((merchant) => (
              <div
                key={merchant.id}
                className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg cursor-pointer"
                onClick={() => handleSelect(merchant.id)}
              >
                {merchant.logoUrl ? (
                  <Image src={merchant.logoUrl} alt={merchant.displayName} width={40} height={40} className="rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">{merchant.displayName?.charAt(0) || 'M'}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{merchant.displayName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChatInterface() {
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
        .find((m: any) => m.senderRole === 'MERCHANT' && !m.readAt);
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
            <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
            <p className="text-muted-foreground">Choose a conversation from the list to start chatting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const merchant = conversation?.merchant;
  const isSender = (msg: any) => msg.senderRole === 'BUYER';

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center space-x-3">
          {merchant?.logoUrl ? (
            <Image src={merchant.logoUrl} alt={merchant.displayName} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">{merchant?.displayName?.charAt(0) || 'M'}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{merchant?.displayName || 'Merchant'}</p>
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


