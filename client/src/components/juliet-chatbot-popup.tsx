import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface JulietChatbotPopupProps {
  onClose?: () => void;
}

export function JulietChatbotPopup({ onClose }: JulietChatbotPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize with welcome message when popup becomes visible
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: 'Hi! I\'m Juliet 👋 I can help you find the perfect supplements for your health goals. What can I help you with today?',
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isVisible, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

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
          conversationHistory: messages.slice(-5)
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
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble right now. Please try again in a moment or contact our support team.',
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

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop for expanded mode */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40 backdrop-blur-sm"
          onClick={handleMinimize}
        />
      )}

      <div className={`fixed transition-all duration-500 ease-out z-50 ${
        isExpanded 
          ? 'bottom-6 left-6 w-96 h-[36rem] shadow-2xl' 
          : 'bottom-6 left-6 w-80 h-auto shadow-xl'
      }`}>
        
        {/* Minimized State */}
        {!isExpanded && (
          <div className="bg-white border-2 border-black overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-black p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base tracking-wide">JULIET</h4>
                    <p className="text-xs opacity-80 font-medium">Wellness Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 p-0 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed font-medium">
                Hi! I'm Juliet. I can help you find the perfect supplements for your health goals.
              </p>
              <Button 
                onClick={handleExpand}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 transition-all duration-200 border-0"
                size="default"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="bg-white border-2 border-black flex flex-col h-full transition-all duration-300">
            {/* Header */}
            <div className="bg-black p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base tracking-wide">JULIET</h4>
                    <p className="text-xs opacity-80 font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Online • Wellness Assistant
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMinimize}
                    className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 p-0 transition-all duration-200"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 p-0 transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-5 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 text-sm font-medium leading-relaxed transition-all duration-200 ${
                        message.isUser
                          ? 'bg-black text-white border-black border'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 shadow-sm px-4 py-3 text-sm flex items-center gap-3 font-medium">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Juliet is typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Suggestions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Quick Questions:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What's in stock?",
                    "Vitamin D benefits",
                    "Bundle deals"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputValue(suggestion)}
                      className="text-xs bg-white hover:bg-black hover:text-white text-gray-700 px-3 py-2 border border-gray-200 transition-all duration-200 font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-5 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 text-sm font-medium border-2 border-gray-200 focus:border-black rounded-none px-4 py-3 transition-all duration-200"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="default"
                  className="bg-black hover:bg-gray-800 px-4 py-3 transition-all duration-200 border-0 rounded-none"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}