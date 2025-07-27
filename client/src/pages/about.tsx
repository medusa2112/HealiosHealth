import { Link } from 'wouter';
import { Microscope, TestTube, Lightbulb, Award, Shield, Users, FlaskConical, CheckCircle, Target, Heart, Zap, Brain } from "lucide-react";
import { SEOHead } from '@/components/seo-head';
import healiosFitnessImg from '@assets/multicultural-fitness-group-looking-at-the-camera-2024-11-28-11-11-49-utc_1753630516538.jpg';
import basketballTeamImg from '@assets/the-game-is-what-brings-us-together-2025-04-06-11-08-01-utc_1753630689523.jpg';
import nutritionistImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="About Healios - Science-Backed Wellness Solutions"
        description="Learn about Healios' mission to provide evidence-based nutritional supplements. Discover our team of scientists, rigorous testing standards, and commitment to your wellness journey."
      />
      
      {/* Hero Section */}
      <section className="pt-5 pb-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Content */}
            <div className="mb-12 lg:mb-0">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  ABOUT HEALIOS
                </p>
                <h1 className="text-3xl lg:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                  We built Healios because we needed it.
                </h1>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Since 1999, we started supplementing seriously, not casually. Not reactively. But as a core part of training, recovery, and performance. We tested everything: ketogenic, carb-cycling, fasted training, CrossFit, hypertrophy splits, marathons, meditation, nootropics, stimulants. We optimised every input we could.
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="text-left">
                  <div className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-0.5">2024</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Founded
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-1">8.9/10</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Customer Satisfaction
                  </p>
                </div>
                <div className="text-left">
                  {/* Empty column for spacing */}
                </div>
              </div>

              <Link href="/products">
                <button className="bg-black text-white px-8 py-4 text-sm font-medium hover:bg-gray-800 transition-colors">
                  Explore our range →
                </button>
              </Link>
            </div>

            {/* Image */}
            <div className="relative h-full overflow-hidden">
              <img
                src={healiosFitnessImg}
                alt="Diverse fitness group representing Healios community of high-performing individuals who prioritize their health"
                className="w-full h-full object-cover object-left-top min-h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      

      {/* Our Principles */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              What We Refused to Compromise On
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple principles that guide every decision we make.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-6">
                <Microscope className="w-8 h-8 text-black dark:text-white mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ingredient Bioavailability
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  Every formula starts with forms that actually absorb. You won't find magnesium oxide or synthetic D2 here. Only bioactive forms with proven uptake — like magnesium bisglycinate (with &gt;80% absorption) and cholecalciferol (D3), used in over 95% of vitamin D outcome trials.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-6">
                <TestTube className="w-8 h-8 text-black dark:text-white mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Therapeutic Dosages
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  No pixie dusting. If it doesn't reach the dose used in peer-reviewed studies, it's not in our formula. Period.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-6">
                <Target className="w-8 h-8 text-black dark:text-white mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Zero Fillers & Additives
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  What's on the tin is what's in the tin. Every capsule is traceable, batch-tested, and third-party verified. You'll never find artificial colours, soy, or titanium dioxide in our stack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We're For */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Image */}
            <div className="order-2 lg:order-1">
              <div className="relative h-96 overflow-hidden">
                <img
                  src={basketballTeamImg}
                  alt="Diverse basketball team representing the Healios community of active individuals who prioritize performance and wellness"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="order-1 lg:order-2">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  WHO WE'RE FOR
                </p>
                <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-6">
                  Who We're For
                </h2>
              </div>

              {/* Personal Statements */}
              <div className="mb-8">
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    You train, but still wake up tired.
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    You eat well, but something feels off.
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    You're high-functioning, but short-fused.
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    You don't want a supplement stack — you want confidence.
                  </p>
                </div>
              </div>

              {/* Main Message */}
              <div>
                <blockquote className="border-l-4 border-healios-cyan pl-6 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    Healios is for people who take care of themselves… but still feel the drag. For those who want to understand what they're taking and feel the difference.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    Not extremes. Not hacks. Just evidence-based supplementation for real life.
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standards & Certifications */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Standards that matter
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our certifications aren't marketing badges—they're proof of pharmaceutical-grade quality.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-8">
                <Shield className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">GMP Certified</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pharmaceutical-grade manufacturing standards</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-8">
                <FlaskConical className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">WADA Approved</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">World Anti-Doping Agency certified</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-8">
                <Award className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">ISO Certified</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">International quality management standards</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-50 dark:bg-gray-800 p-8">
                <CheckCircle className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Third-Party Tested</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Independent laboratory verification</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
            Ready to experience the difference?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join 300,000+ people who've chosen evidence over marketing claims.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <button className="bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors">
                Shop Supplements
              </button>
            </Link>
            <Link href="/consultation">
              <button className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Book Free Consultation
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
