import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssistantSidebar({ isOpen, onClose }: AssistantSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I\'m your Healios nutrition assistant. Ask me anything about our science-backed supplements, ingredients, dosages, or which products might be right for you.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/product-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputValue,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble accessing product information right now. Please try again or contact our support team for assistance.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's the difference between your vitamin D3 and other brands?",
    "Which supplements are best for energy?",
    "Are your products suitable for vegetarians?",
    "What's the recommended daily dosage?",
    "Can I take multiple supplements together?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[420px] lg:w-[480px] flex flex-col p-0 backdrop-blur-xl bg-gradient-to-br from-gray-900 via-black to-gray-800 border-l border-gray-600/30 shadow-2xl">
        {/* Header with gradient background */}
        <SheetHeader className="px-6 py-6 bg-gradient-to-r from-gray-900 via-black to-gray-800 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-transparent to-white/[0.02] animate-pulse"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-white/20">
              <img 
                src="/attached_assets/Screenshot 2025-08-01 at 20.37.58_1754073484896.png" 
                alt="Hannah - Your nutrition expert"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold text-white mb-1">Hannah</SheetTitle>
              <p className="text-sm text-gray-300 font-medium">Product information • Research-based facts</p>
            </div>
          </div>
          {/* Subtle bottom border with gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-black/20 to-transparent">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex items-start gap-3 max-w-[360px] ${
                  message.isUser ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ${
                    message.isUser 
                      ? 'bg-gradient-to-br from-white to-gray-100' 
                      : 'ring-1 ring-gray-600'
                  }`}>
                    {message.isUser ? (
                      <User className="w-4 h-4 text-black" />
                    ) : (
                      <img 
                        src="/attached_assets/Screenshot 2025-08-01 at 20.37.58_1754073484896.png" 
                        alt="Hannah"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${
                    message.isUser
                      ? 'bg-gradient-to-br from-white to-gray-50 text-black border border-gray-200'
                      : 'bg-gradient-to-br from-gray-800/90 to-black/90 text-white border border-gray-700/50'
                  }`}>
                    <div 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                    <p className={`text-xs mt-2 font-medium ${
                      message.isUser ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg ring-1 ring-gray-600">
                    <img 
                      src="/attached_assets/Screenshot 2025-08-01 at 20.37.58_1754073484896.png" 
                      alt="Hannah"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/90 to-black/90 border border-gray-700/50 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                      </div>
                      <span className="text-sm text-white font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Questions (only show if no conversation yet) */}
        {messages.length === 1 && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>
              <p className="text-sm text-white font-medium">Quick questions</p>
            </div>
            <div className="space-y-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs text-left w-full p-3 rounded-xl bg-gradient-to-r from-gray-800/60 to-black/60 border border-gray-700/50 hover:from-white hover:to-gray-100 hover:text-black transition-all duration-300 text-white font-medium shadow-lg backdrop-blur-sm hover:shadow-xl hover:scale-[1.02]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-black backdrop-blur-sm">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex gap-3 pt-4">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about ingredients, dosages, benefits..."
                  className="w-full text-sm bg-gradient-to-r from-gray-800/80 to-black/80 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-white/60 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm focus:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none"></div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}