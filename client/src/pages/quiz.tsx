import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronRight, ChevronLeft, CheckCircle, Mail, MessageSquare, ShoppingBag, ArrowRight, Sparkles, Loader2, User, Heart, Headphones, X, Clock, DollarSign } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  placeholder?: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your primary health goal?",
    type: 'single',
    options: [
      'Better sleep quality',
      'Increased energy levels',
      'Stress management',
      'Immune system support',
      'Digestive health',
      'Overall wellness'
    ]
  },
  {
    id: 2,
    question: "How would you describe your current energy levels?",
    type: 'single',
    options: [
      'Very low - constantly tired',
      'Low - often feel drained',
      'Moderate - some ups and downs',
      'Good - generally energetic',
      'Excellent - always full of energy'
    ]
  },
  {
    id: 3,
    question: "What areas would you like to improve? (Select all that apply)",
    type: 'multiple',
    options: [
      'Sleep quality',
      'Mental clarity and focus',
      'Physical energy',
      'Mood and stress levels',
      'Immune function',
      'Digestive comfort',
      'Skin health'
    ]
  },
  {
    id: 4,
    question: "Do you currently take any supplements?",
    type: 'single',
    options: [
      'No, I don\'t take any supplements',
      'Yes, a few basic vitamins',
      'Yes, multiple targeted supplements',
      'Yes, but not consistently'
    ]
  },
  {
    id: 5,
    question: "What's your age range?",
    type: 'single',
    options: [
      '18-25',
      '26-35',
      '36-45',
      '46-55',
      '56-65',
      '65+'
    ]
  },
  {
    id: 6,
    question: "Do you have any specific dietary preferences or restrictions?",
    type: 'multiple',
    options: [
      'Vegetarian',
      'Vegan',
      'Gluten-free',
      'Dairy-free',
      'No restrictions',
      'Other'
    ]
  }
];

const emailFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  consentToMarketing: z.boolean().refine(val => val === true, {
    message: 'Please consent to receive your personalized recommendations'
  })
});

type EmailFormData = z.infer<typeof emailFormSchema>;

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailFormData, setEmailFormData] = useState<EmailFormData>({
    email: '',
    firstName: '',
    lastName: '',
    consentToMarketing: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPTModal, setShowPTModal] = useState(false);
  const [showNutritionistModal, setShowNutritionistModal] = useState(false);
  const [ptFormData, setPtFormData] = useState({ name: '', email: '', goals: '' });
  const [nutritionistFormData, setNutritionistFormData] = useState({ name: '', email: '', goals: '' });
  const [bookingConfirmation, setBookingConfirmation] = useState<{ type: 'trainer' | 'nutritionist'; bookingId: string } | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch latest article for redirect
  const { data: latestArticle } = useQuery({
    queryKey: ['/api/articles/latest'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Book consultation mutation
  const bookConsultationMutation = useMutation({
    mutationFn: async (data: { type: 'trainer' | 'nutritionist'; name: string; email: string; goals?: string }) => {
      const response = await apiRequest('POST', '/api/consultations/book', data);
      return await response.json();
    },
    onSuccess: (data, variables) => {
      setBookingConfirmation({ type: variables.type, bookingId: data.bookingId });
      // Close modals and reset forms
      setShowPTModal(false);
      setShowNutritionistModal(false);
      setPtFormData({ name: '', email: '', goals: '' });
      setNutritionistFormData({ name: '', email: '', goals: '' });
      
      // Redirect to index page after 3 seconds
      setTimeout(() => {
        setLocation('/');
      }, 3000);
    },
    onError: (error) => {
      // // console.error('Booking failed:', error);
      toast({
        title: "Booking Failed",
        description: "Sorry, we couldn't process your booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  const quizCompletionMutation = useMutation({
    mutationFn: async (data: EmailFormData & { answers: Record<number, string | string[]> }) => {
      return apiRequest('POST', '/api/quiz/complete', data);
    },
    onSuccess: () => {
      setIsCompleted(true);
      toast({
        title: "Quiz Complete!",
        description: "Check your email for personalized recommendations."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleAnswer = (questionId: number, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Auto-advance for single choice questions only
    const currentQ = quizQuestions.find(q => q.id === questionId);
    if (currentQ?.type === 'single') {
      setTimeout(() => {
        if (currentQuestion < quizQuestions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          setIsCompleted(true);
        }
      }, 800); // Small delay to show selection feedback
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowEmailForm(true);
    }
  };

  const handleEmailFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    try {
      emailFormSchema.parse(emailFormData);
      setFormErrors({});
      
      // Submit quiz completion
      quizCompletionMutation.mutate({
        ...emailFormData,
        answers
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      }
    }
  };

  const handleInputChange = (field: keyof EmailFormData, value: string | boolean) => {
    setEmailFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const currentQuestionData = quizQuestions[currentQuestion];
  const currentAnswer = answers[currentQuestionData?.id];
  const isAnswered = currentAnswer && (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer.length > 0);

  // Email Collection Form
  if (showEmailForm && !isCompleted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <SEOHead 
          title="Complete Your Quiz - Healios"
          description="Enter your details to receive personalized supplement recommendations."
        />
        
        <div className="max-w-lg mx-auto px-6 pt-12 pb-24">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-healios-gradient-1 mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2 mb-6">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-medium">
                QUIZ COMPLETE
              </div>
              <h1 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white tracking-tight">
                Get Your Results
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Enter your details to receive personalized supplement recommendations based on your responses.
            </p>
          </div>

          <form onSubmit={handleEmailFormSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={emailFormData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-0 ${
                  formErrors.firstName 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder="Enter your first name"
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={emailFormData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-0 ${
                  formErrors.lastName 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder="Enter your last name"
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={emailFormData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border transition-colors focus:outline-none focus:ring-0 ${
                  formErrors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                placeholder="Enter your email address"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailFormData.consentToMarketing}
                  onChange={(e) => handleInputChange('consentToMarketing', e.target.checked)}
                  className="mt-1 sr-only"
                />
                <div className={`w-5 h-5 border-2 mt-0.5 flex items-center justify-center transition-colors ${
                  emailFormData.consentToMarketing
                    ? 'border-black dark:border-white bg-black dark:bg-white'
                    : formErrors.consentToMarketing
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {emailFormData.consentToMarketing && (
                    <CheckCircle className="w-3 h-3 text-white dark:text-black" />
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  I consent to receive personalized supplement recommendations and wellness content from Healios. 
                  You can unsubscribe at any time. *
                </div>
              </label>
              {formErrors.consentToMarketing && (
                <p className="text-red-500 text-sm mt-1 ml-8">{formErrors.consentToMarketing}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={quizCompletionMutation.isPending}
              className="w-full bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {quizCompletionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Recommendations...
                </>
              ) : (
                <>
                  Get My Recommendations
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              Your information is secure and will only be used to provide personalized recommendations. 
              We never share your data with third parties.
            </p>
          </form>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowEmailForm(false)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              ← Back to Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <SEOHead 
          title="Quiz Complete - Healios Wellness Assessment"
          description="Your personalized supplement recommendations based on your wellness quiz responses."
        />
        
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="space-y-2 mb-8">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-medium">
                ASSESSMENT COMPLETE
              </div>
              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                Quiz Complete
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Thank you for taking our wellness assessment. You should receive personalized supplement recommendations via email shortly.
            </p>
            
            {/* Important Disclaimers */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mt-8 max-w-3xl mx-auto">
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium text-gray-900 dark:text-white mb-3">
                  Important Health Information
                </div>
                
                <div className="space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-gray-900 dark:text-white">Educational Purpose Only:</strong> The recommendations provided are for educational and informational purposes only. They are not intended as medical advice, diagnosis, or treatment.
                  </p>
                  
                  <p>
                    <strong className="text-gray-900 dark:text-white">Consult Healthcare Providers:</strong> Always consult with qualified healthcare professionals before starting any new supplement regimen, especially if you have existing health conditions, take medications, or are pregnant or nursing.
                  </p>
                  
                  <p>
                    <strong className="text-gray-900 dark:text-white">Individual Results Vary:</strong> These recommendations are general suggestions based on your quiz responses. Individual nutritional needs vary significantly based on genetics, lifestyle, medical history, and other factors.
                  </p>
                  
                  <p>
                    <strong className="text-gray-900 dark:text-white">Not Evaluated by Regulatory Bodies:</strong> These statements and product recommendations have not been evaluated by the FDA, TGA, or other regulatory agencies. Our products are not intended to diagnose, treat, cure, or prevent any disease.
                  </p>
                  
                  <p>
                    <strong className="text-gray-900 dark:text-white">Professional Guidance Recommended:</strong> For personalized nutrition advice tailored to your specific health needs, consider consulting with a registered dietitian, nutritionist, or healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Personal Trainer Card */}
            <div 
              onClick={() => setShowPTModal(true)}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Chat with an Online Personal Trainer
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Get personalized fitness guidance and workout plans from certified trainers
                  </p>
                </div>
              </div>
            </div>

            {/* Nutritionist Card */}
            <div 
              onClick={() => setShowNutritionistModal(true)}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Chat with an Online Nutritionist
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Connect with qualified nutritionists for personalized dietary advice and meal planning
                  </p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <Headphones className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Contact our Support Team
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Get help with orders, products, and general wellness questions from our support team
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Trainer Modal */}
          {showPTModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

                <form className="space-y-4">
                  <div>
                    <label htmlFor="pt-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="pt-name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="pt-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="pt-email"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="pt-goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fitness Goals
                    </label>
                    <textarea
                      id="pt-goals"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                      placeholder="Tell us about your fitness goals and any specific areas you'd like to focus on..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                  >
                    Book Consultation - £10
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Nutritionist Modal */}
          {showNutritionistModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-900 max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setShowNutritionistModal(false)}
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

                <form className="space-y-4">
                  <div>
                    <label htmlFor="nut-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="nut-name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nut-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="nut-email"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nut-goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Health & Nutrition Goals
                    </label>
                    <textarea
                      id="nut-goals"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                      placeholder="Tell us about your nutrition goals, dietary restrictions, or health concerns..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                  >
                    Book Consultation - £10
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Booking Confirmation Modal */}
          {bookingConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-900 max-w-md w-full p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 rounded-full">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
                  Booking Confirmed!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  Thank you for booking a consultation with our {bookingConfirmation.type === 'trainer' ? 'Personal Trainer' : 'Nutritionist'}. 
                  You'll receive a confirmation email shortly and our team will contact you within 24-48 hours to schedule your session.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Booking ID:</strong> {bookingConfirmation.bookingId}</p>
                  <p><strong>Session Fee:</strong> £10</p>
                  <p><strong>Duration:</strong> 15 minutes</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Redirecting you to the home page in a few seconds...
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link href="/">
              <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                ← Back to Home
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Wellness Quiz - Healios Personalized Assessment"
        description="Take our 60-second wellness quiz to get personalized supplement recommendations based on your health goals and lifestyle."
      />
      
      <div className="max-w-2xl mx-auto px-6 pt-5 pb-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
            <div 
              className="bg-black dark:bg-white h-2 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-12">
          <h1 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-8 leading-tight">
            {currentQuestionData.question}
          </h1>

          {/* Single Choice */}
          {currentQuestionData.type === 'single' && (
            <div className="space-y-3">
              {currentQuestionData.options?.map((option, index) => (
                <label 
                  key={index}
                  className="block cursor-pointer"
                >
                  <div className={`p-4 border transition-colors ${
                    currentAnswer === option 
                      ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`question-${currentQuestionData.id}`}
                        value={option}
                        checked={currentAnswer === option}
                        onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 transition-colors ${
                        currentAnswer === option 
                          ? 'border-black dark:border-white bg-black dark:bg-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`} />
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Multiple Choice */}
          {currentQuestionData.type === 'multiple' && (
            <div className="space-y-3">
              {currentQuestionData.options?.map((option, index) => (
                <label 
                  key={index}
                  className="block cursor-pointer"
                >
                  <div className={`p-4 border transition-colors ${
                    Array.isArray(currentAnswer) && currentAnswer.includes(option)
                      ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        value={option}
                        checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                        onChange={(e) => {
                          const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
                          if (e.target.checked) {
                            handleAnswer(currentQuestionData.id, [...currentAnswers, option]);
                          } else {
                            handleAnswer(currentQuestionData.id, currentAnswers.filter(a => a !== option));
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 transition-colors ${
                        Array.isArray(currentAnswer) && currentAnswer.includes(option)
                          ? 'border-black dark:border-white bg-black dark:bg-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`} />
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              currentQuestion === 0
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`flex items-center gap-2 px-8 py-3 font-medium transition-colors ${
              isAnswered
                ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
            }`}
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Complete Quiz' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Back to Home Link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link href="/">
            <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              ← Back to Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}