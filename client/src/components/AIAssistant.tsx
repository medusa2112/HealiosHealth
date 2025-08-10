import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink,
  Minimize2,
  Maximize2,
  X,
  User,
  Bot
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Message } from '@shared/types';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

export function AIAssistant({ isOpen, onToggle, isMinimized, onMinimize }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I\'m your Healios assistant. I can help you with order tracking, returns, product questions, and more. How can I help you today?',
        timestamp: new Date().toISOString(),
      }]);
    }
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          sessionToken: sessionToken || undefined 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Store session info
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
      }
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again or contact support@healios.com for assistance.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Escalation mutation
  const escalateMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!sessionId) throw new Error('No active session');
      
      const response = await fetch('/api/ai-assistant/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, reason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to escalate');
      }
      
      return response.json();
    },
    onSuccess: () => {
      const escalationMessage: Message = {
        id: `escalation-${Date.now()}`,
        role: 'assistant',
        content: 'Your conversation has been escalated to our support team. They will contact you within 24 hours.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, escalationMessage]);
    }
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ messageId, rating }: { messageId: string; rating: 'positive' | 'negative' }) => {
      if (!sessionId) return;
      
      const response = await fetch('/api/ai-assistant/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, rating, feedback: `Rating for message ${messageId}` })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      return response.json();
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    sendMessageMutation.mutate(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEscalate = () => {
    escalateMutation.mutate('User requested human support');
  };

  const handleFeedback = (messageId: string, rating: 'positive' | 'negative') => {
    feedbackMutation.mutate({ messageId, rating });
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] z-50 shadow-2xl border-2">
      <CardHeader className="p-4 border-b bg-black text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Healios AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            {onMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMinimize}
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black border'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' ? (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Feedback buttons for assistant messages */}
                        {message.role === 'assistant' && message.id !== 'welcome' && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, 'positive')}
                              className="h-6 w-6 p-0 hover:bg-green-100"
                              disabled={feedbackMutation.isPending}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, 'negative')}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                              disabled={feedbackMutation.isPending}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 border">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2 mb-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={sendMessageMutation.isPending}
                className="flex-1"
                maxLength={1000}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                size="sm"
                className="bg-black hover:bg-gray-800"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => setInputMessage('Track my order')}
              >
                Track Order
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => setInputMessage('I want to return an item')}
              >
                Returns
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => setInputMessage('Shipping information')}
              >
                Shipping
              </Badge>
              {sessionId && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-red-100 text-xs"
                  onClick={handleEscalate}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Contact Support
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Chat bubble component for triggering the assistant (temporarily disabled)
export function ChatBubble({ onClick }: { onClick: () => void }) {
  return null;
}