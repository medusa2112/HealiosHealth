import { Link } from 'wouter';
import { CheckCircle, Phone, Video, Clock, User, Target, Heart } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';
import nutritionistImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';

export default function Consultation() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Free Nutrition Consultation - Expert Healios Advice"
        description="Book your complimentary 1:1 nutrition consultation with Healios experts. Get personalized supplement recommendations and wellness advice tailored to your health goals."
      />
      
      {/* Hero Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Content */}
            <div className="mb-12 lg:mb-0">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  FREE CONSULTATION
                </p>
                <h1 className="text-3xl lg:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                  Expert nutrition advice.<br />
                  No sales pitch.
                </h1>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Get honest, evidence-based advice from our team of qualified nutritionists. We'll help you understand what your body actually needs—not what marketing wants you to buy.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    30-minute one-on-one session
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Personalized supplement recommendations
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Evidence-based nutrition guidance
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Written summary of recommendations
                  </span>
                </div>
              </div>

              <button className="bg-black text-white px-8 py-4 text-sm font-medium hover:bg-gray-800 transition-colors">
                Book your free consultation →
              </button>
            </div>

            {/* Image */}
            <div className="relative">
              <img
                src={nutritionistImg}
                alt="Professional Healios nutritionist providing expert consultation and personalized wellness advice"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              What to expect
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A genuine conversation about your health goals, not a sales presentation.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-8">
              <User className="w-8 h-8 text-black dark:text-white mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Personal Assessment
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                We'll discuss your health history, current symptoms, lifestyle factors, and wellness goals to understand your unique needs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-8">
              <Target className="w-8 h-8 text-black dark:text-white mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Tailored Recommendations
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Based on scientific evidence and your individual profile, we'll recommend specific nutrients, dosages, and timing.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-8">
              <Heart className="w-8 h-8 text-black dark:text-white mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Ongoing Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Follow-up email with written recommendations and the option for future check-ins to track your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Options */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Choose your consultation format
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Both options provide the same level of expert advice and personalized recommendations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 p-8">
              <Video className="w-12 h-12 text-black dark:text-white mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Video Call
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Face-to-face consultation via Zoom or Teams. Personal interaction allows for deeper discussion and visual assessment.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>30 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Most popular option</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-8">
              <Phone className="w-12 h-12 text-black dark:text-white mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Phone Call
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Voice-only consultation. Perfect if you prefer audio calls or have limited internet connectivity.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>30 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Convenient and flexible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Book your consultation
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Available Monday-Friday, 9am-6pm GMT. We'll confirm your appointment within 24 hours.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />

              <input
                type="tel"
                placeholder="Phone number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />

              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">What's your main health goal?</option>
                <option value="energy">Better energy levels</option>
                <option value="sleep">Improved sleep quality</option>
                <option value="stress">Stress management</option>
                <option value="immunity">Immune system support</option>
                <option value="digestion">Digestive health</option>
                <option value="general">General wellness</option>
                <option value="other">Other (we'll discuss)</option>
              </select>

              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">Preferred consultation format</option>
                <option value="video">Video call (Zoom/Teams)</option>
                <option value="phone">Phone call</option>
              </select>

              <textarea
                placeholder="Tell us briefly about any current supplements you take or health concerns (optional)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />

              <button
                type="submit"
                className="w-full bg-black text-white py-4 px-6 font-medium hover:bg-gray-800 transition-colors"
              >
                Request consultation
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                Free consultation. No purchase required. We'll contact you within 24 hours to schedule.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Common questions
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Is the consultation really free?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, completely free. No purchase required, no hidden costs. We believe everyone deserves access to quality nutrition advice.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Who will I speak with?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You'll speak with one of our qualified nutritionists who have experience in supplement science and personalized nutrition.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Will you try to sell me supplements?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No sales pressure. Our goal is to provide honest advice about what you actually need. If supplements can help, we'll explain why. If they won't, we'll tell you that too.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                How long until I see results?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This depends on your individual situation, but most people notice improvements in energy and sleep within 2-4 weeks of following evidence-based recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Take the first step toward better health with expert nutrition advice.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors">
              Book Free Consultation
            </button>
            <Link href="/quiz">
              <button className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Take Quick Quiz Instead
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}