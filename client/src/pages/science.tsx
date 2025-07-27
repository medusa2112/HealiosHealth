import { Link } from 'wouter';
import { Microscope, TestTube, Lightbulb, Award, Shield, Users, FlaskConical, CheckCircle, Target, Heart, Brain, Zap, Star } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';
import healiosGummiesImg from '@assets/Screenshot 2025-07-26 at 21.46.49_1753559220742.png';

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
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To offer effective, safe, and science-backed nutritional gummies targeting common functional health needs: immune support, energy metabolism, gut health, skin/hair wellness, and cognitive balance — all through bioavailable, verified doses and clean delivery formats.
                </p>
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

            <div className="relative">
              <img
                src={healiosGummiesImg}
                alt="Healios gummy supplements showcasing premium quality and scientific formulation by Nutribl"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Research Foundation - Card grid style */}
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

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                  <TestTube className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Vitamin D3</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Meta-analyses confirm benefits in immune regulation, bone density, and reducing infection risk in deficient populations. [EFSA claim ID 280]
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Iron + Vitamin C</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clinical data supports that ascorbic acid improves absorption of non-heme iron, especially in menstruating women. [EFSA claim ID 291]
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Folic Acid</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Strong clinical evidence for pre-conception neural tube defect reduction. [EFSA claim ID 274]
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Biotin</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Maintenance of normal skin and hair; most studies show benefits at ≥5000 µg/day. [EFSA claim ID 318]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Effectiveness - Table style */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Clinical Effectiveness
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Each formulation is aligned to clinically effective dose ranges based on peer-reviewed research.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 text-sm font-medium text-gray-900 dark:text-white">Nutrient</th>
                    <th className="text-left py-4 text-sm font-medium text-gray-900 dark:text-white">Healios Dose</th>
                    <th className="text-left py-4 text-sm font-medium text-gray-900 dark:text-white">Evidence-Based Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">Vitamin D3</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">1000 IU / 4000 IU</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">800–4000 IU for deficiency</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">Iron</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">14 mg elemental</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">10–18 mg (women); paired with 80 mg Vitamin C</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">Biotin</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">5000–10,000 µg</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">≥5000 µg shown effective for nail/hair strength</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">Magnesium (citrate)</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">90 mg</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">200–400 mg daily split dosing</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">Folic Acid</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">400 µg</td>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300">400 µg/day (pre-conception)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users - Pill style */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Target Users
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our supplements are designed for specific demographics with targeted health needs.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-black text-white px-6 py-3 text-sm">
              Adults aged 18–55 managing energy, immunity, stress
            </div>
            <div className="bg-black text-white px-6 py-3 text-sm">
              Parents buying children's multivitamins (ages 3–12)
            </div>
            <div className="bg-black text-white px-6 py-3 text-sm">
              Women supplementing for hair/skin, fatigue, pregnancy
            </div>
            <div className="bg-black text-white px-6 py-3 text-sm">
              Fitness-focused men aged 25–45
            </div>
          </div>

          <div className="mt-12 bg-white dark:bg-gray-700 p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All products are safe for daily use within UK tolerable upper intake levels, unless otherwise noted.
            </p>
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