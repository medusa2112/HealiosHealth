import { Link } from 'wouter';
import { Microscope, TestTube, Lightbulb, Award, Shield, Users, FlaskConical, CheckCircle, Target, Heart, Brain, Zap, Star } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';
import biotinProductImg from '@assets/Multivitamin & Mineral for Children (2)_1753633320058.png';

export default function Science() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="The Science Behind Healios Supplements"
        description="Discover the rigorous scientific research, clinical studies, and nutritional expertise that powers Healios premium wellness supplements."
      />
      {/* Hero Section - Homepage style */}
      <section className="pt-5 pb-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  THE HEALIOS SCIENCE
                </p>
                <h1 className="text-3xl lg:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                  Science-backed nutrition.<br />
                  Effective. Safe. Verified.
                </h1>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">To offer effective, safe, and science-backed nutritional gummies targeting common functional health needs: immune support, energy metabolism, gut health, skin/hair wellness, and cognitive balance. All through bioavailable, verified doses and clean delivery formats.</p>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">12</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    EFSA-Backed Products
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">100%</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Clinical Dosing
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">0</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Unproven Claims
                  </p>
                </div>
              </div>

              <Link href="/products">
                <button className="bg-black text-white px-8 py-4 text-sm font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-all">
                  Explore our supplements →
                </button>
              </Link>
            </div>

            <div className="relative -mt-6 -mr-6">
              <img
                src={biotinProductImg}
                alt="Healios Biotin 5000µg supplement bottle showcasing premium black packaging and professional product design"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Research Foundation - Clean minimal design */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Research Foundation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              All active ingredients used in Healios gummies are selected based on EFSA-supported nutrient claims or substantiated clinical research.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 px-6">
            {/* Vitamin D3 */}
            <div className="text-center p-4">
              <div className="w-24 h-24 mx-auto mb-6">
                <img 
                  src="/assets/Vitamin D3  1000 IU_1753615197740.png" 
                  alt="Vitamin D3 1000 IU Gummies"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Vitamin D3
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">1000 IU / 4000 IU</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Meta-analyses confirm benefits in immune regulation, bone density, and reducing infection risk in deficient populations.
              </p>
              <a 
                href="https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2010.1468" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                EFSA Claim ID: 280
              </a>
            </div>

            {/* Iron + Vitamin C */}
            <div className="text-center p-4">
              <div className="w-24 h-24 mx-auto mb-6">
                <img 
                  src="/assets/Iron + Vitamin C_1753615197739.png" 
                  alt="Iron + Vitamin C Gummies"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Iron + Vitamin C
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">14mg + 80mg</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Clinical data supports that ascorbic acid improves absorption of non-heme iron, especially in menstruating women.
              </p>
              <a 
                href="https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2010.1589" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                EFSA Claim ID: 291
              </a>
            </div>

            {/* Folic Acid */}
            <div className="text-center p-4">
              <div className="w-24 h-24 mx-auto mb-6">
                <img 
                  src="/assets/Folic Acid 400µg_1753615197741.png" 
                  alt="Folic Acid 400µg Gummies"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Folic Acid
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">400µg</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Strong clinical evidence for pre-conception neural tube defect reduction.
              </p>
              <a 
                href="https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2009.1213" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                EFSA Claim ID: 274
              </a>
            </div>

            {/* Biotin */}
            <div className="text-center p-4">
              <div className="w-24 h-24 mx-auto mb-6">
                <img 
                  src="/assets/Biton_1753615197741.png" 
                  alt="Biotin 5000µg Gummies"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Biotin
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">5000µg</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Maintenance of normal skin and hair; most studies show benefits at ≥5000 µg/day.
              </p>
              <a 
                href="https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2010.1728" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                EFSA Claim ID: 318
              </a>
            </div>

            {/* Magnesium */}
            <div className="text-center p-4">
              <div className="w-24 h-24 mx-auto mb-6">
                <img 
                  src="/assets/Magnesium_1753615197741.png" 
                  alt="Magnesium Citrate Gummies"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Magnesium Citrate
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">90mg</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Supports muscle function, energy metabolism, and reduction of tiredness and fatigue. Superior bioavailability compared to oxide forms.
              </p>
              <a 
                href="https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2010.1807" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                EFSA Claim ID: 230
              </a>
            </div>

            {/* Ashwagandha */}
            <div className="text-center p-4">
              <div className="w-24 h-24 mx-auto mb-6">
                <img 
                  src="/assets/Ashwagandha 600mg_1753615197741.png" 
                  alt="Ashwagandha 600mg Gummies"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ashwagandha Root Extract
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">300mg (5% withanolides)</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Traditional adaptogenic herb with emerging research on stress response and cortisol regulation.
              </p>
              <a 
                href="https://www.ema.europa.eu/en/medicines/herbal/withania-somnifera" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                EMA Traditional Use
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Ingredient Spotlight */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-12">
            <div className="text-center mb-12">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                Featured Ingredient: Lichen-Derived Vitamin D3
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our flagship Vitamin D3 is sourced from wild lichen harvested in the pristine environments of Iceland and Norway, providing a vegan-friendly alternative to traditional lanolin-derived D3 with superior bioavailability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-600 p-6 text-center">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">1000-4000 IU</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Daily Dosage Range</p>
              </div>
              <div className="bg-white dark:bg-gray-600 p-6 text-center">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">100% Vegan</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Plant-Based Source</p>
              </div>
              <div className="bg-white dark:bg-gray-600 p-6 text-center">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">EFSA-Approved</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Health Claims</p>
                <a 
                  href="https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2010.1468" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  View Claim ID: 280
                </a>
              </div>
              <div className="bg-white dark:bg-gray-600 p-6 text-center">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">Nordic Origin</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Iceland & Norway</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width Video Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onLoadStart={() => console.log('Title video loading started')}
          onCanPlay={() => console.log('Title video can play')}
          onLoadedData={() => console.log('Title video loaded')}
        >
          <source src="/assets/title-video.webm" type="video/webm" />
          <source src="/assets/title-video.mp4" type="video/mp4" />
          <source src="/assets/title-video.mov" type="video/quicktime" />
          Your browser does not support the video tag.
        </video>
      </section>
      {/* Quality Standards - Ticked list style */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-6">
                Quality Standards
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Every active nutrient in our formulations meets rigorous scientific criteria.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    EFSA-approved health claim
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Referenced in clinical human studies with sufficient dosing data
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Aligned with NHS/UKRI nutrient recommendations
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    No homeopathy, unproven superfoods, or speculative additives
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-50 dark:bg-gray-800 p-8">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                  Gummy Administration
                </h3>
                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>All Healios products are manufactured in gummy form for enhanced compliance and taste.</p>
                  <p>Doses are capped at safe daily intake levels and generally require 1–2 gummies/day.</p>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">Formulation considerations:</p>
                    <ul className="space-y-1 pl-4">
                      <li>• Gastric acid resistance (probiotics)</li>
                      <li>• Mouthfeel and sugar content (max 2.5g sugar/gummy)</li>
                      <li>• Allergen exclusion (gluten-free, gelatin-free)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Market Position - Stats style */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Market Position
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Positioned at the intersection of science-backed wellness and functional convenience.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-700 p-6">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">R179-R285</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Price Range (SA Market)
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-700 p-6">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">Premium</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Market Segment
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-700 p-6">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">Science</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Positioning
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-700 p-6">
                <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">Gummy</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Format
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Regulatory & Ethics - Background image style */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-6">
                Regulatory Compliance
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">UK Food Information Regulations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All labelling follows UK Food Information Regulations and EFSA Health Claims Register
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Traditional Use Ingredients</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Traditional-use ingredients (Ashwagandha, ACV, turmeric) are clearly marked [Unverified] or [Traditional Use] when applicable
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Safety Warnings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Child safety and upper intake warnings are included where required (e.g., Iron, Vitamin D3)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-6">
                Environmental & Ethical Factors
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Manufacturing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All gummies are produced in GMP-certified UK or EU facilities
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Packaging</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    PET bottles or fully recyclable pouches with clear sustainability messaging
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Ethics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Products are cruelty-free and contain no artificial colours or fillers. Vegan or vegetarian status is declared clearly on every label.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
            Ready to experience science-backed wellness?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Discover scientifically-formulated supplements designed to support your wellness journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <button className="bg-black text-white px-8 py-4 font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-all">
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