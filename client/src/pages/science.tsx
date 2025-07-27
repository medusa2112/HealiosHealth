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
      {/* Research Foundation - Modern card grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Research Foundation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              All active ingredients used in Healios gummies are selected based on EFSA-supported nutrient claims or substantiated clinical research.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Vitamin D3 Card */}
            <div className="bg-white dark:bg-gray-700 p-8 border-l-4 border-yellow-400 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white text-xl font-bold">
                  D3
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Vitamin D3
                  </h3>
                  <div className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 text-xs font-medium mb-3">
                    1000 IU / 4000 IU
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Meta-analyses confirm benefits in immune regulation, bone density, and reducing infection risk in deficient populations.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    EFSA Claim ID: 280
                  </div>
                </div>
              </div>
            </div>

            {/* Iron + Vitamin C Card */}
            <div className="bg-white dark:bg-gray-700 p-8 border-l-4 border-red-400 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white text-xl font-bold">
                  Fe
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Iron + Vitamin C
                  </h3>
                  <div className="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 text-xs font-medium mb-3">
                    14mg + 80mg
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Clinical data supports that ascorbic acid improves absorption of non-heme iron, especially in menstruating women.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    EFSA Claim ID: 291
                  </div>
                </div>
              </div>
            </div>

            {/* Folic Acid Card */}
            <div className="bg-white dark:bg-gray-700 p-8 border-l-4 border-green-400 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xl font-bold">
                  B9
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Folic Acid
                  </h3>
                  <div className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 text-xs font-medium mb-3">
                    400µg
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Strong clinical evidence for pre-conception neural tube defect reduction.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    EFSA Claim ID: 274
                  </div>
                </div>
              </div>
            </div>

            {/* Biotin Card */}
            <div className="bg-white dark:bg-gray-700 p-8 border-l-4 border-purple-400 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                  B7
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Biotin
                  </h3>
                  <div className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 text-xs font-medium mb-3">
                    5000µg
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Maintenance of normal skin and hair; most studies show benefits at ≥5000 µg/day.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    EFSA Claim ID: 318
                  </div>
                </div>
              </div>
            </div>

            {/* Magnesium Card */}
            <div className="bg-white dark:bg-gray-700 p-8 border-l-4 border-blue-400 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
                  Mg
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Magnesium Citrate
                  </h3>
                  <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 text-xs font-medium mb-3">
                    90mg
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Supports muscle function, energy metabolism, and reduction of tiredness and fatigue. Superior bioavailability compared to oxide forms.
                  </p>
                </div>
              </div>
            </div>

            {/* Ashwagandha Card */}
            <div className="bg-white dark:bg-gray-700 p-8 border-l-4 border-amber-400 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold">
                  ASH
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ashwagandha Root Extract
                  </h3>
                  <div className="inline-block bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 text-xs font-medium mb-3">
                    300mg (5% withanolides)
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Traditional adaptogenic herb with emerging research on stress response and cortisol regulation.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Traditional Use
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Clinical Effectiveness - Ingredient breakdown style */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Ingredients of Integrity
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Clean ingredients from ethical sources, always
            </p>
          </div>

          <div className="space-y-16">
            {/* Vitamin D3 Breakdown */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="relative mb-8 lg:mb-0">
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 h-80 flex items-center justify-center">
                  <div className="text-6xl">☀️</div>
                </div>
              </div>
              
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                  Nutrients of Integrity
                </p>
                <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-8">
                  Premium vitamin sources, sustainably sourced
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                    A closer look: Cholecalciferol strength profile
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Source</span>
                      <span className="text-sm text-gray-900 dark:text-white">Lichen-derived cholecalciferol</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Form</span>
                      <span className="text-sm text-gray-900 dark:text-white">Vitamin D3 (1000 IU / 4000 IU)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Country of origin</span>
                      <span className="text-sm text-gray-900 dark:text-white">Iceland, Norway</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Found in</span>
                      <span className="text-sm text-gray-900 dark:text-white">Vitamin D3 gummies</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                    What makes it extraordinary
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 border-l-2 border-gray-300 dark:border-gray-600">
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">
                      "Vitamin D3 has been essential for bone health and immune function, with clinical studies showing significant benefits at 1000-4000 IU daily dosing."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Iron + Vitamin C Breakdown */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="relative mb-8 lg:mb-0">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 h-80 flex items-center justify-center">
                  <div className="text-6xl">⚡</div>
                </div>
              </div>
              
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                  Nutrients of Integrity
                </p>
                <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-8">
                  Enhanced absorption mineral complex
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                    A closer look: Iron + Vitamin C synergy profile
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Source</span>
                      <span className="text-sm text-gray-900 dark:text-white">Ferric pyrophosphate + ascorbic acid</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Form</span>
                      <span className="text-sm text-gray-900 dark:text-white">14mg Iron + 80mg Vitamin C</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Country of origin</span>
                      <span className="text-sm text-gray-900 dark:text-white">Germany, Switzerland</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Found in</span>
                      <span className="text-sm text-gray-900 dark:text-white">Iron + Vitamin C gummies</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                    What makes it extraordinary
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 border-l-2 border-gray-300 dark:border-gray-600">
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">
                      "Iron with Vitamin C has been clinically proven to enhance absorption by up to 300%, particularly beneficial for women of reproductive age."
                    </p>
                  </div>  
                </div>
              </div>
            </div>

            {/* Biotin Breakdown */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="relative mb-8 lg:mb-0">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 h-80 flex items-center justify-center">
                  <div className="text-6xl">✨</div>
                </div>
              </div>
              
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                  Nutrients of Integrity
                </p>
                <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-8">
                  High-potency beauty support vitamin
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                    A closer look: Biotin therapeutic strength profile
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Source</span>
                      <span className="text-sm text-gray-900 dark:text-white">Synthetic D-biotin (pharmaceutical grade)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Form</span>
                      <span className="text-sm text-gray-900 dark:text-white">5000µg (10,000% NRV)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Country of origin</span>
                      <span className="text-sm text-gray-900 dark:text-white">Netherlands, Belgium</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Found in</span>
                      <span className="text-sm text-gray-900 dark:text-white">Biotin 5000µg gummies</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">
                    What makes it extraordinary
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 border-l-2 border-gray-300 dark:border-gray-600">
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">
                      "Biotin at 5000µg provides therapeutic-level support for hair, skin and nail maintenance, with visible results typically seen within 8-12 weeks."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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