import { useState } from "react";

const questions = [
  {
    id: 1,
    question: "What is your primary health goal?",
    options: [
      "Increase energy levels",
      "Support immune system",
      "Improve digestion",
      "Build muscle/strength",
      "Manage stress & sleep"
    ]
  },
  {
    id: 2,
    question: "How would you describe your current diet?",
    options: [
      "Very healthy & balanced",
      "Generally good with some gaps",
      "Average - could be better",
      "Poor - lots of processed foods",
      "Restricted due to allergies/preferences"
    ]
  },
  {
    id: 3,
    question: "How often do you exercise?",
    options: [
      "Daily intensive workouts",
      "4-5 times per week",
      "2-3 times per week",
      "Once a week or less",
      "No regular exercise"
    ]
  }
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold text-darkText mb-8">
              Your Personalized Recommendations
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
              Based on your answers, here are our top supplement recommendations for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-heading text-xl font-semibold text-darkText mb-4">
                Premium Multivitamin
              </h3>
              <p className="text-gray-600 mb-4">
                Perfect for filling nutritional gaps and boosting overall health.
              </p>
              <div className="text-brandYellow font-semibold">Recommended: 95% match</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-heading text-xl font-semibold text-darkText mb-4">
                Omega-3 Complex
              </h3>
              <p className="text-gray-600 mb-4">
                Supports heart health, brain function, and reduces inflammation.
              </p>
              <div className="text-brandYellow font-semibold">Recommended: 87% match</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-heading text-xl font-semibold text-darkText mb-4">
                Probiotic Complex
              </h3>
              <p className="text-gray-600 mb-4">
                Enhances digestive health and supports immune function.
              </p>
              <div className="text-brandYellow font-semibold">Recommended: 82% match</div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={resetQuiz}
              className="bg-brandYellow text-darkText py-3 px-8 rounded-md font-semibold hover:bg-yellow-500 transition-colors mr-4"
            >
              Retake Quiz
            </button>
            <button className="border border-darkText text-darkText py-3 px-8 rounded-md font-semibold hover:bg-gray-50 transition-colors">
              Shop Recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-darkText mb-8">
            Nutrition Quiz
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer a few questions to get personalized supplement recommendations tailored to your lifestyle and health goals.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brandYellow h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="font-heading text-2xl font-semibold text-darkText mb-8">
              {questions[currentQuestion].question}
            </h2>
            
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left p-4 border border-gray-300 rounded-md hover:border-brandYellow hover:bg-yellow-50 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}