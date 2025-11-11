'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickChatDialogProps {
  merchantId: string;
  merchantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickChatDialog({ merchantId, merchantName, open, onOpenChange }: QuickChatDialogProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { 
    createOrGetConversation, 
    sendMessage, 
    getMessagesForConversation,
    isConnected,
    activeConversationId,
    setActiveConversation,
    joinConversation,
    loadMessages,
  } = useChat();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationMessages = conversationId ? getMessagesForConversation(conversationId) : [];

  // Load or create conversation when dialog opens
  useEffect(() => {
    if (open && isAuthenticated && merchantId) {
      createOrGetConversation(merchantId).then((result: any) => {
        const conversation = (result.payload as any)?.data || result.payload;
        if (conversation) {
          setConversationId(conversation.id);
          setActiveConversation(conversation.id);
          loadMessages(conversation.id);
        }
      });
    }
  }, [open, isAuthenticated, merchantId, createOrGetConversation, setActiveConversation, loadMessages]);

  // Subscribe to conversation when conversationId is available
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }
  }, [conversationId, isConnected, joinConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSend = async () => {
    if (!message.trim() || !conversationId || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(conversationId, message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Please login to send messages</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-[600px] max-w-md">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat with {merchantName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Online' : 'Connecting...'}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {conversationId ? (
            conversationMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              conversationMessages.map((msg: any) => {
                const isSender = msg.senderRole === 'BUYER';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        isSender
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.content && <p>{msg.content}</p>}
                      <p className={`text-xs mt-1 ${
                        isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isSending || !conversationId}
            />
            <Button 
              onClick={handleSend} 
              disabled={!message.trim() || isSending || !conversationId}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

