import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Star, Leaf, Award, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo-head';

export default function HomePage() {
  const { toast } = useToast();

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been subscribed to our newsletter.",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Wild Nutrition - Premium Food-Grown® Supplements | Better Absorbed, Better Retained"
        description="Discover award-winning Food-Grown® supplements with 113% better absorption. Premium vitamins for women's health, fertility, energy, and wellness. Free shipping over $50."
        keywords="food-grown supplements, natural vitamins, women's health, fertility supplements, Wild Nutrition, better absorption, premium supplements"
        ogImage="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630"
      />

      {/* Wild Nutrition Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
        >
          <source src="/hero-video.webm" type="video/webm" />
          <source src="/hero-video.mp4" type="video/mp4" />
          {/* Fallback image if video fails to load */}
          <img 
            src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          {/* Food-Grown Badge */}
          <div className="inline-flex items-center bg-white/90 text-gray-900 px-4 py-2 text-sm font-medium mb-8">
            Food-Grown® Supplements - Better absorbed, Better retained
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-8">
            Feel Better.
            <br />
            <em className="font-light italic">Every day</em>
          </h1>

          {/* CTA Button */}
          <div className="mb-12">
            <Link href="/products">
              <button className="bg-white text-gray-900 px-8 py-4 font-medium text-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
                Shop Food-Grown® supplements →
              </button>
            </Link>
          </div>

          {/* Rating and Customer Count */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-white text-white" />
                ))}
              </div>
              <span className="font-medium">4.84 RATING</span>
            </div>
            <div className="text-xs opacity-80">
              LOVED BY 300,000+ CUSTOMERS
            </div>
          </div>
        </div>

        {/* Press Mentions Footer */}
        <div className="absolute bottom-8 left-6 right-6 lg:left-12 lg:right-12">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-white text-xs font-medium opacity-70">
            <span>The Telegraph</span>
            <span>VOGUE</span>
            <span>Women's Health</span>
            <span>GRAZIA</span>
            <span>The Telegraph</span>
            <span>VOGUE</span>
            <span>Women's Health</span>
            <span>GRAZIA</span>
          </div>
        </div>
      </section>

      {/* Wild Nutrition Bestsellers Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1 mb-12 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-4">
                Supplements That Don't Pretend.
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 uppercase tracking-wide">
                EVERY LIFE STAGE, EVERY HEALTH GOAL
              </p>

              {/* Category Pills */}
              <div className="space-y-2 mb-8">
                <div className="flex flex-wrap gap-2">
                  <button className="bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition-colors">
                    BESTSELLERS
                  </button>
                  <Link href="/products/apple-cider-vinegar">
                    <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      DIGESTIVE
                    </button>
                  </Link>
                  <Link href="/products/vitamin-d3">
                    <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      IMMUNITY
                    </button>
                  </Link>
                  <Link href="/products/ashwagandha">
                    <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      STRESS
                    </button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/products/probiotics">
                    <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      GUT HEALTH
                    </button>
                  </Link>
                  <Link href="/products/magnesium">
                    <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      SLEEP
                    </button>
                  </Link>
                  <Link href="/products/ashwagandha">
                    <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      ADAPTOGENS
                    </button>
                  </Link>
                  <Link href="/products/vitamin-d3">
                    <button className="border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      ENERGY
                    </button>
                  </Link>
                </div>
              </div>

              <Link href="/products">
                <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                  See full collection →
                </button>
              </Link>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Product 1 - Apple Cider Vinegar & Ginger */}
              <Link href="/products/apple-cider-vinegar">
                <div className="group cursor-pointer" itemScope itemType="https://schema.org/Product">
                  <div className="relative bg-gradient-to-br from-orange-100 to-yellow-200 p-8 mb-4 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs font-medium">
                      BESTSELLER
                    </div>
                    <img
                      src="/attached_assets/Apple-Cider-Vinegar-X_1753469577640.png"
                      alt="Apple Cider Vinegar & Ginger Gummies"
                      className="w-32 h-40 object-contain"
                      itemProp="image"
                    />
                    <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                      +Add
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-healios-cyan transition-colors" itemProp="name">
                    Apple Cider Vinegar & Ginger (60 Gummies)
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span className="line-through text-gray-400">£29.99</span> <span itemProp="price" content="16.99">£16.99</span>
                    <meta itemProp="priceCurrency" content="GBP" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                    <li>✓ Digestive support</li>
                    <li>✓ Metabolic wellness</li>
                    <li>✓ Anti-inflammatory properties</li>
                  </ul>
                </div>
              </Link>

              {/* Product 2 - Vitamin D3 Gummies */}
              <Link href="/products/vitamin-d3">
                <div className="group cursor-pointer" itemScope itemType="https://schema.org/Product">
                  <div className="relative bg-gradient-to-br from-yellow-100 to-orange-200 p-8 mb-4 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs font-medium">
                      SALE
                    </div>
                    <img
                      src="/attached_assets/Vitamin-D3-4000iu-X-1_1753469577640.png"
                      alt="Vitamin D3 4000 IU Gummies"
                      className="w-32 h-40 object-contain"
                      itemProp="image"
                    />
                    <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                      +Add
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-healios-cyan transition-colors" itemProp="name">
                    Vitamin D3 (60 Gummies)
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span className="line-through text-gray-400">£26.99</span> <span itemProp="price" content="15.99">£15.99</span>
                    <meta itemProp="priceCurrency" content="GBP" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                    <li>✓ Immunity support</li>
                    <li>✓ Bone health</li>
                    <li>✓ Mood support</li>
                  </ul>
                </div>
              </Link>

              {/* Product 3 - KSM-66 Ashwagandha */}
              <Link href="/products/ashwagandha">
                <div className="group cursor-pointer" itemScope itemType="https://schema.org/Product">
                  <div className="relative bg-gradient-to-br from-green-100 to-teal-200 p-8 mb-4 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs font-medium">
                      ADAPTOGEN
                    </div>
                    <img
                      src="/attached_assets/Ashwagandha-X-2_1753469577639.webp"
                      alt="KSM-66 Ashwagandha Capsules"
                      className="w-32 h-40 object-contain"
                      itemProp="image"
                    />
                    <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                      +Add
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-healios-cyan transition-colors" itemProp="name">
                    KSM-66 Ashwagandha® (90 Capsules)
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span className="line-through text-gray-400">£37.99</span> <span itemProp="price" content="18.99">£18.99</span>
                    <meta itemProp="priceCurrency" content="GBP" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                    <li>✓ Stress reduction</li>
                    <li>✓ Cortisol balance</li>
                    <li>✓ Mental focus</li>
                  </ul>
                </div>
              </Link>

              {/* Product 4 - Probiotic Complex */}
              <Link href="/products/probiotics">
                <div className="group cursor-pointer" itemScope itemType="https://schema.org/Product">
                  <div className="relative bg-gradient-to-br from-blue-100 to-purple-200 p-8 mb-4 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs font-medium">
                      GUT HEALTH
                    </div>
                    <img
                      src="/attached_assets/Probiotics10Bil-X_1753469577640.png"
                      alt="10 Billion CFU Probiotic Complex"
                      className="w-32 h-40 object-contain"
                      itemProp="image"
                    />
                    <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                      +Add
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-healios-cyan transition-colors" itemProp="name">
                    10 Billion CFU Probiotic Complex (60 Capsules)
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span className="line-through text-gray-400">£37.99</span> <span itemProp="price" content="18.99">£18.99</span>
                    <meta itemProp="priceCurrency" content="GBP" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                    <li>✓ Gut health</li>
                    <li>✓ Immunity support</li>
                    <li>✓ Digestive balance</li>
                  </ul>
                </div>
              </Link>

              {/* Product 5 - Magnesium Complex */}
              <Link href="/products/magnesium">
                <div className="group cursor-pointer" itemScope itemType="https://schema.org/Product">
                  <div className="relative bg-gradient-to-br from-purple-100 to-pink-200 p-8 mb-4 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs font-medium">
                      SLEEP
                    </div>
                    <img
                      src="/attached_assets/Magnesium-X_1753469577641.png"
                      alt="Magnesium Complex Capsules"
                      className="w-32 h-40 object-contain"
                      itemProp="image"
                    />
                    <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                      +Add
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-healios-cyan transition-colors" itemProp="name">
                    Magnesium Complex (120 Capsules)
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span className="line-through text-gray-400">£24.99</span> <span itemProp="price" content="14.99">£14.99</span>
                    <meta itemProp="priceCurrency" content="GBP" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                    <li>✓ Sleep regulation</li>
                    <li>✓ Muscle function</li>
                    <li>✓ Nervous system balance</li>
                  </ul>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pregnancy & New Mother Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Single Image */}
            <div className="relative mb-12 lg:mb-0">
              <div className="aspect-video bg-amber-50 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
                  alt="Pregnant woman with natural supplements for maternal health"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                Supporting <em className="italic">every</em> wellness journey
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Science-backed, clinically researched supplements designed to support 
                your health goals at every stage of life, from foundational wellness to specialized needs.
              </p>

              <Link href="/products">
                <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                  Explore Healios wellness range →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Healios Science Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Content */}
            <div className="mb-12 lg:mb-0">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  THE HEALIOS DIFFERENCE
                </p>
                <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                  Science-backed wellness solutions<br />
                  designed for optimal <em className="italic">bioavailability</em><br />
                  and maximum health impact.
                </h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div>
                  <div className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-2">99%</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    PURE ACTIVE INGREDIENTS<br />
                    NO UNNECESSARY FILLERS
                  </p>
                </div>

                <div>
                  <div className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-2">300K+</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    SATISFIED CUSTOMERS<br />
                    WORLDWIDE
                  </p>
                </div>

                <div>
                  <div className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-2">15+</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    YEARS OF RESEARCH<br />
                    & DEVELOPMENT
                  </p>
                </div>

                <div>
                  <div className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-2">600mg</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    CLINICALLY EFFECTIVE<br />
                    ASHWAGANDHA DOSAGE<br />
                    (KSM-66®)
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto">
                    Shop Healios supplements →
                  </button>
                </Link>
                <Link href="/science">
                  <button className="border border-healios-cyan text-healios-cyan px-6 py-3 text-sm font-medium hover:bg-healios-cyan hover:text-white transition-colors w-full sm:w-auto">
                    Learn about our science →
                  </button>
                </Link>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
                <p className="mb-1">*Based on clinical research and customer satisfaction data. Individual results may vary.</p>
                <p>**KSM-66® is a registered trademark of Ixoreal Biomed Inc.</p>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Scientific research and development of premium wellness supplements"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Expert Consultation Section */}
      <section className="bg-white dark:bg-gray-900">
        {/* Icons Header */}
        <div className="bg-healios-gradient-2 py-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className="text-white">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-wide">
                  PREMIUM<br />
                  INGREDIENTS
                </p>
              </div>

              <div className="text-white">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-wide">
                  THIRD-PARTY<br />
                  TESTED
                </p>
              </div>

              <div className="text-white">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H15V1h-2v1H7V1H5v1H.5C-.13 2-.13 3.87.5 4H19c.63-.13.63-1.87 0-2z"/>
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-wide">
                  CLINICALLY<br />
                  RESEARCHED
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Consultation Content */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              {/* Consultation Form */}
              <div className="mb-12 lg:mb-0">
                <div className="mb-8">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    BOOK YOUR COMPLIMENTARY CONSULTATION TODAY
                  </p>
                  <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                    Expert 1:1 nutritional advice
                  </h2>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Bespoke advice tailored to you</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Health goals & symptom support</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Phone or video call</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-black flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">99% would recommend to a friend</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-6">
                  <Link href="/consultation">
                    <button className="w-full bg-black text-white px-6 py-4 text-sm font-medium hover:bg-gray-800 transition-colors">
                      Book your free 1:1 consultation →
                    </button>
                  </Link>

                  <Link href="/quiz">
                    <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-6 py-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Take our 60-second supplement quiz →
                    </button>
                  </Link>
                </div>
              </div>

              {/* Nutritionists Image */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Three professional nutritionists ready to provide expert 1:1 consultation"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 mb-12 lg:mb-0">
              <div className="mb-6">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">4.84 RATING</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">EXCELLENT</p>

                <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                  Loved by over<br />
                  300,000 customers
                </h2>
              </div>

              {/* Category Pills */}
              <div className="space-y-2 mb-8">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-black text-white px-3 py-1 text-xs font-medium">ALL</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">SLEEP</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">ENERGY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">BEAUTY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">FERTILITY</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">PREGNANCY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">IMMUNITY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">STRESS</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">GUT HEALTH</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">GENERAL WELLBEING</span>
                </div>
              </div>

              <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                Shop bestsellers →
              </button>
            </div>

            {/* Reviews Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Review 1 */}
              <div className="bg-white dark:bg-gray-700 p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  I am so surprised by this product. I take an hour before bed and fall asleep with such ease. I wake up refreshed and I cannot say enough about how grateful I am for having good sleep sleep. Highly recommended!
                </p>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">JANINE</p>
                  <div className="flex items-center gap-2">
                    <img src="/attached_assets/Magnesium-X_1753469577641.png" alt="Healios Magnesium Complex" className="w-8 h-10 object-contain" />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">Magnesium Complex</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">View product</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="bg-white dark:bg-gray-700 p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  Excellent customer service. Very prompt reply and Lizzie went out of her way to assist. Really good products too, top quality ingredients. Would recommend!
                </p>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">CATHERINE</p>
                </div>
              </div>

              {/* Review 3 */}
              <div className="bg-white dark:bg-gray-700 p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  Really pleased with these excellent quality supplements that have made a big difference to my energy levels which have lowered significantly due to the peri menopause.
                </p>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">LISA</p>
                  <div className="flex items-center gap-2">
                    <img src="/attached_assets/Ashwagandha-X-2_1753469577639.webp" alt="Healios Ashwagandha Energy Support" className="w-8 h-10 object-contain" />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">KSM-66 Ashwagandha</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">View product</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Photos */}
          <div className="mt-16">
            <div className="flex items-center justify-center gap-4 overflow-x-auto">
              {[
                "https://images.unsplash.com/photo-1494790108755-2616b612b637?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2",
                "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&fit=facearea&facepad=2"
              ].map((src, index) => (
                <div key={index} className="flex-shrink-0">
                  <img
                    src={src}
                    alt={`Happy customer ${index + 1}`}
                    className="w-16 h-16 object-cover border-2 border-white dark:border-gray-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-4">
            Join the Healios community
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Be part of 300,000+ enjoying science-backed wellness
          </p>

          <form className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="First name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-teal-500"></div>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Last name"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-teal-500"></div>
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 bg-teal-500"></div>
              </div>
            </div>

            <input
              type="text"
              placeholder="Your Birthday"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-6 font-medium hover:bg-gray-800 transition-colors"
            >
              Sign up now
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Company</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">What is Food-Grown®</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Why Subscribe?</Link></li>
                <li><Link href="/science" className="hover:text-white transition-colors">The Science</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Sustainability</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* Help & Information Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Help & Information</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/contact" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Refunds & Returns</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Store Finder</Link></li>
              </ul>
            </div>

            {/* Shop Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Shop</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/products" className="hover:text-white transition-colors">Bestsellers</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Increase Energy</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Better Sleep</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Immunity Support</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Pregnancy Supplements</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Vegan Supplements</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Shop All</Link></li>
              </ul>
            </div>

            {/* Get Involved Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Get Involved</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/contact" className="hover:text-white transition-colors">Sign up to our newsletter</Link></li>
                <li><Link href="/consultation" className="hover:text-white transition-colors">Join our Practitioner Community</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Follow us on Instagram</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Read the Wild Journal</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <span className="text-sm text-gray-400">🇬🇧 UNITED KINGDOM (GBP £)</span>
              <button className="text-xs text-gray-400 uppercase tracking-wide hover:text-white transition-colors">
                CHANGE
              </button>
            </div>

            <p className="text-sm text-gray-400">
              © 2025 Healios Ltd
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}