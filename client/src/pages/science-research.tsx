import { Link } from 'wouter';
import { Microscope, ExternalLink, CheckCircle, XCircle, FileText, Users, Award, AlertTriangle } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';

export default function ScienceResearch() {
  const ingredientData = [
    {
      ingredient: 'Vitamin D3 (4000 IU)',
      function: 'Immune support, bone maintenance, muscle function',
      evidenceTier: 'EFSA + NHS',
      efsa: true
    },
    {
      ingredient: 'Iron + Vitamin C',
      function: 'Energy, fatigue reduction, red blood cell formation',
      evidenceTier: 'EFSA + PubMed',
      efsa: true
    },
    {
      ingredient: 'Biotin (5000 µg)',
      function: 'Hair growth, nail strength, skin support',
      evidenceTier: 'EFSA + Trials',
      efsa: true
    },
    {
      ingredient: 'Folic Acid',
      function: 'Neural tube protection, red blood formation, pregnancy prep',
      evidenceTier: 'EFSA + WHO',
      efsa: true
    },
    {
      ingredient: 'Ashwagandha (300mg)',
      function: 'Cortisol regulation, sleep quality, stress adaptation',
      evidenceTier: 'Clinical Trials',
      efsa: false
    },
    {
      ingredient: 'Magnesium Citrate',
      function: 'Muscle recovery, anxiety reduction, energy support',
      evidenceTier: 'EFSA + Meta-Analyses',
      efsa: true
    },
    {
      ingredient: 'Lactobacillus Blend',
      function: 'Gut balance, digestion, bloating relief',
      evidenceTier: 'Human Trials (non-EFSA)',
      efsa: false
    },
    {
      ingredient: 'Apple Cider Vinegar',
      function: 'Appetite, digestion, metabolic support',
      evidenceTier: 'Emerging Evidence*',
      efsa: false,
      traditional: true
    }
  ];

  const researchSources = [
    {
      name: 'EFSA Health Claims Register',
      url: 'https://ec.europa.eu/food/safety/labelling_nutrition/claims/register/public/',
      description: 'European Food Safety Authority validated health claims database'
    },
    {
      name: 'NHS Nutrition Guidelines',
      url: 'https://www.nhs.uk/live-well/eat-well/vitamins-and-minerals/',
      description: 'UK National Health Service nutritional recommendations'
    },
    {
      name: 'PubMed Clinical Studies',
      url: '#',
      description: 'Peer-reviewed clinical research database with human trials'
    },
    {
      name: 'World Health Organization (WHO)',
      url: '#',
      description: 'Global micronutrient guidance and safety recommendations'
    },
    {
      name: 'Cochrane Reviews',
      url: '#',
      description: 'Systematic reviews on probiotics, iron absorption, and botanicals'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Research Behind Our Formulas - Evidence-Based Supplements | Healios"
        description="Discover the clinical research, EFSA approvals, and peer-reviewed studies behind every Healios supplement. Science-backed formulations, not marketing hype."
        keywords="supplement research, EFSA health claims, clinical trials, evidence-based nutrition, peer-reviewed studies, healios science"
        url="https://healios.com/science/research"
      />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 text-sm font-medium mb-6">
                <Microscope className="w-4 h-4" />
                Research & Evidence
              </div>
              <h1 className="text-4xl lg:text-6xl font-light text-gray-900 dark:text-white mb-6 leading-tight">
                The research behind<br />
                <span className="text-blue-600 dark:text-blue-400">every formula we make</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                At Healios, every product starts with a simple rule: If there's no research to support it, we don't use it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Standards */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Formulated on Evidence — Not Hype
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We work only with ingredients that meet our strict evidence criteria
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                EFSA Approved
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validated health claims from the European Food Safety Authority
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Clinical Trials
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Backed by peer-reviewed clinical trials in humans
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Traditional Use
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Used traditionally with safety data — clearly marked as such
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Ingredients Table */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Key Active Ingredients: Clinical Highlights
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every active ingredient with its research-backed function and evidence tier
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    Ingredient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    Research-Backed Function
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    Evidence Tier
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ingredientData.map((item, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {item.efsa ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                        )}
                        {item.ingredient}
                        {item.traditional && (
                          <span className="text-xs text-orange-600 dark:text-orange-400">*</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.function}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.evidenceTier}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p>*All traditional-use or non-EFSA actives are clearly marked on our product pages.</p>
          </div>
        </div>
      </section>

      {/* Research Sources */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              Research Sources We Follow
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We base all claims, formulation logic, and product development on these public sources
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchSources.map((source, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {source.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {source.description}
                </p>
                {source.url !== '#' && (
                  <a 
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Visit Source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Don't Use */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-4">
              What We Don't Use
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our commitment to evidence means we avoid these common industry practices
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                Unrecognised Claims
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claims not recognised by EFSA (unless clearly marked as traditional)
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                Poor Bioavailability
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ingredients with poor human absorption or lacking bioavailability data
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                Ineffective Doses
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Doses too low to deliver real benefit based on clinical research
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-light text-white mb-6">
            Want to See the Data?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            We keep a transparent ingredient-by-ingredient evidence log, available to healthcare professionals, journalists, regulatory reviewers, and curious customers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="bg-white text-black px-8 py-4 font-medium hover:bg-gray-100 transition-colors">
                Request Research Summary
              </button>
            </Link>
            <Link href="/science">
              <button className="border border-gray-400 text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors">
                Explore Our Science
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}