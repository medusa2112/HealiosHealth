import { Link } from 'wouter';
import { Microscope, TestTube, Lightbulb, Award, Shield, Users, FlaskConical, CheckCircle } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';
import healiosGummiesImg from '@assets/Screenshot 2025-07-26 at 21.46.49_1753559220742.png';

export default function Science() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="The Science Behind Healios Supplements"
        description="Discover the rigorous scientific research, clinical studies, and nutritional expertise that powers Healios premium wellness supplements."
      />
      
      {/* Hero Section */}
      <section className="pt-5 pb-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Content */}
            <div className="mb-12 lg:mb-0">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  THE HEALIOS SCIENCE
                </p>
                <h1 className="text-3xl lg:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                  Evidence-based nutrition.<br />
                  No shortcuts. No compromises.
                </h1>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every Healios supplement is manufactured in GMP-certified facilities using rigorous quality control processes. Our commitment to scientific excellence ensures you receive premium wellness products you can trust.
                </p>
              </div>

              {/* Key Statistics */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">GMP</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Certified Facilities
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">280+</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Contaminant Tests
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">ISO</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Quality Certified
                  </p>
                </div>
              </div>

              <Link href="/products">
                <button className="bg-black text-white px-8 py-4 text-sm font-medium hover:bg-gray-800 transition-colors">
                  Explore our supplements →
                </button>
              </Link>
            </div>

            {/* Image */}
            <div className="relative">
              <img
                src={healiosGummiesImg}
                alt="Healios Apple Cider Vinegar & Ginger Gummies showcasing premium supplement quality and scientific formulation"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Principles */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Our Scientific Principles
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every decision we make is guided by scientific evidence and nutritional expertise.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Clinical Validation */}
            <div className="bg-white dark:bg-gray-700 p-8">
              <div className="mb-6">
                <Microscope className="w-8 h-8 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                  Clinical Validation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  We select ingredients based on available research and formulate our supplements to support your wellness routine.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Peer-reviewed research validation
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Clinical dosage accuracy
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Evidence-based formulations
                  </span>
                </div>
              </div>
            </div>

            {/* Laboratory Testing */}
            <div className="bg-white dark:bg-gray-700 p-8">
              <div className="mb-6">
                <TestTube className="w-8 h-8 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                  Laboratory Testing
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Every batch undergoes comprehensive testing by accredited laboratories following USP standards for identity, purity, potency, and contaminant screening.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Heavy metals (lead, mercury, cadmium, arsenic)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Microbiological testing for harmful bacteria
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Pesticide residue analysis
                  </span>
                </div>
              </div>
            </div>

            {/* Expert Formulation */}
            <div className="bg-white dark:bg-gray-700 p-8">
              <div className="mb-6">
                <Lightbulb className="w-8 h-8 text-black dark:text-white mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                  Expert Formulation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Our team of nutritional scientists and researchers develop formulations based on the latest scientific understanding.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    PhD nutritional scientists
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Bioavailability optimization
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Synergistic nutrient combinations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Standards */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Content */}
            <div className="mb-12 lg:mb-0">
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-6">
                Rigorous Research Standards
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Our formulation process is guided by peer-reviewed research and established nutritional science. Each ingredient is carefully selected based on scientific evidence and safety profiles.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-white dark:text-black text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Literature Review
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comprehensive analysis of peer-reviewed studies and clinical trials spanning the last decade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-white dark:text-black text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Dosage Optimization
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Formulating with clinically-relevant amounts based on established nutritional guidelines and research.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-white dark:text-black text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Bioavailability Testing
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ensuring nutrients are in forms that your body can actually absorb and utilize effectively.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-white dark:text-black text-sm font-medium">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Quality Validation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Independent laboratory verification of purity, potency, and safety for every batch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-8">
                  <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">500+</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Studies Reviewed
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-8">
                  <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">24</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Quality Tests
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-8">
                  <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">0</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Marketing Fillers
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-8">
                  <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">100%</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Transparency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Standards */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Manufacturing Excellence
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              All Healios supplements are manufactured in FDA-registered facilities following Current Good Manufacturing Practice (cGMP) standards with comprehensive quality control processes.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NSF/ANSI 455-2</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Good Manufacturing Practice certification with ongoing facility audits.
              </p>
            </div>

            <div className="text-center">
              <FlaskConical className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">USP Verified</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                United States Pharmacopeia verification for ingredient purity and potency.
              </p>
            </div>

            <div className="text-center">
              <Award className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">FDA Registered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Facilities registered with FDA following 21 CFR Part 111 regulations.
              </p>
            </div>

            <div className="text-center">
              <Users className="w-12 h-12 text-black dark:text-white mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Third-Party Testing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Independent laboratory verification of every batch for safety and potency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
            Ready to experience science-backed wellness?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Discover scientifically-formulated supplements designed to support your wellness journey.
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