import { Link } from "wouter";
import { Waves, Recycle, Heart, Globe, Users, Target, ArrowRight, CheckCircle } from "lucide-react";
import { SEOHead } from '@/components/seo-head';

export default function Planet() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Ocean Cleanup Partnership - Environmental Impact | Healios"
        description="Every Healios supplement purchase contributes to The Ocean Cleanup's mission to rid our oceans of plastic pollution. Join our environmental initiative for a healthier planet."
        keywords="ocean cleanup, environmental supplements, sustainable health products, plastic pollution, healios ocean partnership, environmental impact"
        url="https://healios.com/planet"
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 text-sm font-medium mb-6">
              <Waves className="w-4 h-4" />
              Environmental Partnership
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 dark:text-white mb-6">
              Healing Our Planet,
              <br />
              <span className="text-blue-600 dark:text-blue-400">One Supplement at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Every Healios purchase contributes to The Ocean Cleanup's mission to rid our oceans of plastic pollution. Together, we're creating a healthier planet for future generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <button className="bg-black text-white px-8 py-4 font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-all">
                  Shop for the Planet
                </button>
              </Link>
              <a 
                href="https://theoceancleanup.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                Learn About The Ocean Cleanup
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Video Section */}
      <section className="relative">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-[60vh] lg:h-[70vh] object-cover"
          onLoadStart={() => console.log('Planet page video loading started')}
          onCanPlay={() => console.log('Planet page video can play')}
          onLoadedData={() => console.log('Planet page video loaded')}
          onError={(e) => console.error('Planet page video error:', e)}
        >
          <source src="/assets/home-header-1080p-v3_1753639749380.webm" type="video/webm" />
          <source src="/assets/home-header-1080p-v3_1753639749380.webm" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Optional overlay content if needed */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl lg:text-6xl font-light mb-4">Our Environmental Impact</h2>
            <p className="text-lg lg:text-xl max-w-2xl mx-auto px-6">
              Through our partnership with The Ocean Cleanup, every Healios purchase makes a measurable difference
            </p>
          </div>
        </div>
      </section>

      {/* The Ocean Cleanup Partnership */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-6">
                Why The Ocean Cleanup?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Founded by Dutch inventor Boyan Slat, The Ocean Cleanup is developing advanced technologies to rid the ocean of plastic pollution. Their innovative systems collect plastic waste from the Great Pacific Garbage Patch and prevent more plastic from entering the ocean via rivers.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    First organization to successfully extract plastic from the Great Pacific Garbage Patch
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Developing river cleanup systems to prevent ocean plastic pollution
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Committed to transparency with regular impact reporting
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Science-based approach aligned with our commitment to evidence-based solutions
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="bg-white dark:bg-gray-700 p-8 shadow-lg">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                  How Your Purchases Help
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white font-medium flex items-center justify-center text-sm">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">You Purchase Healios Supplements</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Every product sold contributes to our monthly ocean cleanup fund</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white font-medium flex items-center justify-center text-sm">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Monthly Contribution</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">We make regular monthly donations to support The Ocean Cleanup's operations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white font-medium flex items-center justify-center text-sm">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Ocean Impact</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Funds support plastic extraction and prevention technologies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white font-medium flex items-center justify-center text-sm">4</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Transparency Reports</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quarterly impact updates shared with our community</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Practices */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-6">
              Our Environmental Commitments
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Beyond our ocean cleanup partnership, we're exploring opportunities to improve our environmental practices as we grow our business responsibly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-8">
              <Recycle className="w-10 h-10 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Sustainable Packaging</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Working toward more sustainable packaging solutions as we grow, with current recyclable PET bottles and ongoing assessment of eco-friendly alternatives.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-8">
              <Globe className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Environmentally Safe Ingredients</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our botanicals are sourced from certified organic farms using regenerative agriculture. Marine-derived minerals are harvested through ocean-safe methods, and all plant extracts come from suppliers committed to biodiversity preservation.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-8">
              <Users className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Environmental Awareness</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sharing information about ocean health and environmental wellness through our community content and The Ocean Cleanup partnership.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-8">
              <Target className="w-10 h-10 text-orange-600 dark:text-orange-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Continuous Improvement</h3>
              <p className="text-gray-600 dark:text-gray-400">
                As a growing brand, we're committed to evaluating and improving our environmental practices while maintaining product quality and safety standards.
              </p>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-8">
              <Heart className="w-10 h-10 text-teal-600 dark:text-teal-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Quality Manufacturing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our supplements are manufactured in GMP-certified facilities that meet strict quality and safety standards.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8">
              <Waves className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Ocean Conservation Focus</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our primary environmental commitment is supporting ocean cleanup through our partnership with The Ocean Cleanup organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Timeline */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-6">
              Our Environmental Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tracking our progress toward a cleaner, healthier planet.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-600 text-white font-medium flex items-center justify-center">Q4</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">2024: Partnership Launch</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Established monthly contribution program with The Ocean Cleanup to support ocean plastic removal efforts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-green-600 text-white font-medium flex items-center justify-center">Q1</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">2025: Sustainable Ingredient Sourcing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 text-xs font-medium mr-2">Complete</span>
                  Our supplements use responsibly sourced botanicals including sustainably harvested ashwagandha from certified organic farms, marine-friendly magnesium citrate, and ethically sourced turmeric from regenerative agriculture practices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-teal-600 text-white font-medium flex items-center justify-center">Q2</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">2025: Packaging Assessment</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 text-xs font-medium mr-2">In Progress</span>
                  Evaluating ocean-safe packaging alternatives and recyclable materials while maintaining product freshness and safety standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-600 text-white font-medium flex items-center justify-center">Q3</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">2025: Environmental Education</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 text-xs font-medium mr-2">Planned</span>
                  Expanding content about ocean health, sustainable wellness practices, and ingredient transparency for our community.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-indigo-600 text-white font-medium flex items-center justify-center">Q4</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">2025: Partnership Growth</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 text-xs font-medium mr-2">Goal</span>
                  Exploring opportunities to expand our environmental impact through additional sustainable sourcing initiatives and ocean cleanup contributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-white mb-6">
            Join the Movement for Ocean Health
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Every supplement you choose contributes to cleaner oceans and a healthier planet. Together, we're making a measurable difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <button className="bg-white text-blue-600 px-8 py-4 font-medium hover:bg-blue-50 transition-colors">
                Shop Supplements
              </button>
            </Link>
            <Link href="/quiz">
              <button className="border border-blue-300 text-white px-8 py-4 font-medium hover:bg-blue-700 transition-colors">
                Take Wellness Quiz
              </button>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="text-blue-200 text-sm">
              Want quarterly impact reports? Join our newsletter for transparency updates and environmental insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}