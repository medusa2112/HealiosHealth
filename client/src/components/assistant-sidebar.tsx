import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, User, MessageCircle, Mail, Heart, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import hannahImage from '@assets/healios-health125.png';

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
      content: 'Hi! I\'m Hannah. I provide factual information about our products based on research and scientific evidence. Ask me about ingredients, formulations, or product details.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPTModal, setShowPTModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
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

  const handleEmailSupport = () => {
    window.location.href = 'mailto:hello@thefourths.com?subject=Customer Support Inquiry&body=Hi, I need help with...';
  };

  const handlePTConsultation = () => {
    setShowPTModal(true);
  };

  const handleNutritionConsultation = () => {
    setShowNutritionModal(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[420px] lg:w-[480px] flex flex-col p-0 bg-black sm:backdrop-blur-2xl sm:bg-black/40 border-l border-white/10 shadow-2xl">
        {/* Header with gradient background */}
        <SheetHeader className="px-4 sm:px-6 py-4 sm:py-6 bg-black sm:bg-black/60 sm:backdrop-blur-xl relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-transparent to-white/[0.02] animate-pulse"></div>
          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-white/20">
              <img 
                src={hannahImage} 
                alt="Hannah - Product information assistant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg sm:text-xl font-bold text-white mb-1">Hannah</SheetTitle>
              <SheetDescription className="text-xs sm:text-sm text-gray-300 font-medium">Product information • Research-based facts</SheetDescription>
            </div>
          </div>
          {/* Subtle bottom border with gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3 sm:p-6 bg-black sm:bg-black/10">
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[360px] ${
                  message.isUser ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ${
                    message.isUser 
                      ? 'bg-gradient-to-br from-white to-gray-100' 
                      : 'ring-1 ring-gray-600'
                  }`}>
                    {message.isUser ? (
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                    ) : (
                      <img 
                        src={hannahImage} 
                        alt="Hannah"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className={`rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-sm ${
                    message.isUser
                      ? 'bg-gradient-to-br from-white to-gray-50 text-black border border-gray-200'
                      : 'bg-gradient-to-br from-gray-800/90 to-black/90 text-white border border-gray-700/50'
                  }`}>
                    <div 
                      className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                    <p className={`text-[10px] sm:text-xs mt-2 font-medium ${
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
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shadow-lg ring-1 ring-gray-600">
                    <img 
                      src={hannahImage} 
                      alt="Hannah"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/90 to-black/90 border border-gray-700/50 rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                      </div>
                      <span className="text-xs sm:text-sm text-white font-medium">Thinking...</span>
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
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-black sm:bg-black/30 sm:backdrop-blur-xl">
            <div className="mb-2 sm:mb-3 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>
              <p className="text-xs sm:text-sm text-white font-medium">Quick questions</p>
            </div>
            <div className="space-y-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-[10px] sm:text-xs text-left w-full p-2 sm:p-3 rounded-xl bg-gradient-to-r from-gray-800/60 to-black/60 border border-gray-700/50 hover:from-white hover:to-gray-100 hover:text-black transition-all duration-300 text-white font-medium shadow-lg backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] leading-tight"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="px-3 sm:px-6 py-2 bg-black sm:bg-black/30 sm:backdrop-blur-xl border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEmailSupport}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
            >
              <Mail className="w-3 h-3" />
              Email Support
            </button>
            <button
              onClick={handlePTConsultation}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-200"
            >
              <User className="w-3 h-3" />
              PT Consultation
            </button>
            <button
              onClick={handleNutritionConsultation}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors duration-200"
            >
              <Heart className="w-3 h-3" />
              Nutrition
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-3 sm:p-6 bg-black sm:bg-black/60 sm:backdrop-blur-xl">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about ingredients, dosages, benefits..."
                  className="w-full text-xs sm:text-sm bg-black border-white/30 text-white placeholder:text-gray-400 focus:border-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg focus:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none"></div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-white hover:bg-gray-100 text-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
              </Button>
            </div>
          </div>
        </div>

        {/* PT Modal */}
        {showPTModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white dark:bg-gray-900 max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowPTModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                  Personal Training Consultation
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Connect with a certified personal trainer for personalized fitness guidance tailored to your goals.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">15-Minute Consultation</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Quick assessment of your fitness goals and current level</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">£10 Session Fee</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Professional consultation with certified trainer</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">What You'll Get</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Personalized workout recommendations, form guidance, and goal-setting strategies</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    window.location.href = 'mailto:hello@thefourths.com?subject=PT Consultation Booking&body=Hi, I would like to book a 15-minute Personal Training consultation for £10. Please let me know available times.';
                    setShowPTModal(false);
                  }}
                  className="w-full bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors font-medium"
                >
                  Book Consultation - £10
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Modal */}
        {showNutritionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white dark:bg-gray-900 max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowNutritionModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                  Nutrition Consultation
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Work with a qualified nutritionist to create a personalized nutrition plan that supports your wellness goals.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">15-Minute Consultation</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Initial assessment of your dietary needs and health goals</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">£10 Session Fee</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Professional consultation with registered nutritionist</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">What You'll Get</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Personalized nutrition advice, meal planning guidance, and supplement recommendations</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    window.location.href = 'mailto:hello@thefourths.com?subject=Nutrition Consultation Booking&body=Hi, I would like to book a 15-minute Nutrition consultation for £10. Please let me know available times.';
                    setShowNutritionModal(false);
                  }}
                  className="w-full bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors font-medium"
                >
                  Book Consultation - £10
                </button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}