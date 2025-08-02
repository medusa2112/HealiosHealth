import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, ChevronLeft, CheckCircle, Mail, MessageSquare, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';

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

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);

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
      setIsCompleted(true);
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-healios-gradient-1 mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2 mb-8">
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-medium">
                ASSESSMENT COMPLETE
              </div>
              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white tracking-tight">
                Quiz Complete
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Thank you for taking our wellness assessment. Based on your responses, we'll recommend personalized supplements to support your health goals.
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Email Card */}
            <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Personalized product recommendations based on your assessment
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Expert Guidance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Connect with our wellness team for personalized support
                  </p>
                </div>
              </div>
            </div>

            {/* Shop Card */}
            <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 hover:border-black dark:hover:border-white transition-all duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Science-Backed Range
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Browse our complete collection of premium supplements
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-12 text-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Start with expert guidance or explore our full product range
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <Link href="/contact" className="w-full sm:w-auto">
                  <button className="w-full bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2">
                    Contact Our Team
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/products" className="w-full sm:w-auto">
                  <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 font-medium hover:bg-white hover:border-black dark:hover:bg-gray-700 dark:hover:border-white transition-all duration-200">
                    Shop Products
                  </button>
                </Link>
              </div>
            </div>
          </div>

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