import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Star, Leaf, Award, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo-head';
import appleCiderVinegarImg from '@assets/Apple-Cider-Vinegar-X_1753469577640.png';
import vitaminD3Img from '@assets/Vitamin-D3-4000iu-X-1_1753469577640.png';
import ashwagandhaImg from '@assets/Ashwagandha-X-2_1753469577639.webp';
import probioticsImg from '@assets/Probiotics10Bil-X_1753469577640.png';
import magnesiumImg from '@assets/Magnesium-X_1753469577641.png';
import wellnessVideoSrc from '@assets/Healios (3)_1753504393390.mov';
import nutritionistImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';

export default function HomePage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('BESTSELLERS');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  // Category filtering logic
  const categories = {
    BESTSELLERS: 'all',
    DIGESTIVE: ['apple-cider-vinegar'],
    IMMUNITY: ['vitamin-d3'],
    STRESS: ['ashwagandha'],
    'GUT HEALTH': ['probiotics'],
    SLEEP: ['magnesium'],
    ADAPTOGENS: ['ashwagandha'],
    ENERGY: ['vitamin-d3']
  };

  const handleCategoryChange = async (category: string) => {
    if (category === selectedCategory) return;
    
    setIsFilterLoading(true);
    setSelectedCategory(category);
    
    // Simulate loading for smooth UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsFilterLoading(false);
  };

  const getFilteredProducts = () => {
    if (!featuredProducts) return [];
    
    const categoryFilter = categories[selectedCategory as keyof typeof categories];
    if (categoryFilter === 'all') return featuredProducts;
    
    return featuredProducts.filter((product: any) => 
      categoryFilter.includes(product.id)
    );
  };

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
        image="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630"
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
          <div className="inline-flex items-center bg-transparent text-white border border-white px-4 py-2 text-sm font-medium mb-8">
            Engineered for tired bodies, broken sleep, and stressed systems.
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-8">
            Feel Better.
            <br />
            <em className="font-light italic">Every day</em>
          </h1>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <button className="bg-black text-white px-8 py-4 font-medium text-lg border border-black hover:bg-white hover:text-black hover:border-black transition-colors focus:outline-none focus:ring-2 focus:ring-white">
                Explore The Range
              </button>
            </Link>
            <Link href="/quiz">
              <button className="border border-white/30 text-white px-8 py-4 font-medium text-lg bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50">
                Take a Quiz
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
                  <button 
                    onClick={() => handleCategoryChange('BESTSELLERS')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'BESTSELLERS' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    BESTSELLERS
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('DIGESTIVE')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'DIGESTIVE' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Digestive
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('IMMUNITY')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'IMMUNITY' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Immunity
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('STRESS')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'STRESS' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Stress
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleCategoryChange('GUT HEALTH')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'GUT HEALTH' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Gut Health
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('SLEEP')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'SLEEP' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Sleep
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('ADAPTOGENS')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'ADAPTOGENS' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Adaptogens
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('ENERGY')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'ENERGY' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Energy
                  </button>
                </div>
              </div>

              <Link href="/products">
                <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                  See full collection →
                </button>
              </Link>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3 relative">
              {/* Loading Overlay */}
              {isFilterLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-black animate-spin mb-3"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Loading {selectedCategory.toLowerCase()} products...
                    </p>
                  </div>
                </div>
              )}
              
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${
                isFilterLoading ? 'opacity-50' : 'opacity-100'
              }`}>
                {getFilteredProducts().map((product: any) => {
                  const productImages = {
                    'apple-cider-vinegar': appleCiderVinegarImg,
                    'vitamin-d3': vitaminD3Img,
                    'ashwagandha': ashwagandhaImg,
                    'probiotics': probioticsImg,
                    'magnesium': magnesiumImg
                  };

                  const productGradients = {
                    'apple-cider-vinegar': 'from-orange-100 to-yellow-200',
                    'vitamin-d3': 'from-yellow-100 to-orange-200',
                    'ashwagandha': 'from-green-100 to-teal-200',
                    'probiotics': 'from-blue-100 to-purple-200',
                    'magnesium': 'from-purple-100 to-pink-200'
                  };

                  const productBadges = {
                    'apple-cider-vinegar': 'Bestseller',
                    'vitamin-d3': 'Sale',
                    'ashwagandha': 'Adaptogen',
                    'probiotics': 'Gut Health',
                    'magnesium': 'Sleep'
                  };

                  return (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <div className="group cursor-pointer" itemScope itemType="https://schema.org/Product">
                        {/* Clean White Background for Products - Wild Nutrition Style */}
                        <div className="relative bg-gray-50 dark:bg-gray-800 mb-6 aspect-square overflow-hidden group-hover:shadow-lg transition-all duration-300">
                          {/* Product Badge - Top Left */}
                          <div className="absolute top-3 left-3 bg-white dark:bg-gray-700 text-black dark:text-white px-2 py-1 text-xs font-medium z-10 shadow-sm">
                            {productBadges[product.id as keyof typeof productBadges]}
                          </div>
                          
                          {/* Product Image */}
                          <img
                            src={productImages[product.id as keyof typeof productImages]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            itemProp="image"
                          />
                          
                          {/* Add to Cart Button - Bottom Right */}
                          <button className="absolute bottom-3 right-3 bg-black text-white px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100">
                            Add
                          </button>
                        </div>
                        
                        {/* Product Info - Wild Nutrition Clean Style */}
                        <div className="space-y-2">
                          <h3 className="font-normal text-gray-900 dark:text-white text-sm group-hover:text-healios-cyan transition-colors" itemProp="name">
                            {product.name}
                          </h3>
                          
                          {/* Price */}
                          <div className="text-sm text-gray-800 dark:text-gray-200 font-medium" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                            <span className="line-through text-gray-400 mr-2 text-xs">£{product.originalPrice}</span>
                            <span itemProp="price" content={product.price}>£{product.price}</span>
                            <meta itemProp="priceCurrency" content="GBP" />
                            <meta itemProp="availability" content="https://schema.org/InStock" />
                          </div>
                          
                          {/* Benefits - More Minimal */}
                          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed" itemProp="description">
                            {product.benefits?.slice(0, 2).map((benefit: string, index: number) => (
                              <div key={index} className="flex items-start gap-1">
                                <span className="text-healios-cyan mt-1">•</span>
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pregnancy & New Mother Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Video Section */}
            <div className="relative mb-12 lg:mb-0">
              <div className="aspect-video bg-amber-50 overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadStart={() => console.log('Secondary video loading started')}
                  onCanPlay={() => console.log('Secondary video can play')}
                >
                  <source src={wellnessVideoSrc} type="video/quicktime" />
                  {/* Fallback image if video doesn't load */}
                  <img
                    src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
                    alt="Wellness journey - active lifestyle and natural supplements"
                    className="w-full h-full object-cover"
                  />
                </video>
              </div>
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                Why Choose Healios Supplements?
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We don't promise miracles. We fix what's missing — with the nutrients your body's begging for.
              </p>

              {/* Key Benefits List */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-tight">🔬</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Clinically validated dosages, not marketing blends.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-tight">🧪</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Lab-tested, WADA-safe, UK-manufactured.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-tight">💡</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Designed by nutritional scientists, not influencers.
                  </span>
                </div>
              </div>

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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">99%</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                    Pure Active<br />
                    Ingredients
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">300K+</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                    Satisfied<br />
                    Customers
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">15+</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                    Years of<br />
                    Research
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2">600mg</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                    Clinical<br />
                    Dosage
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
        <div className="bg-black py-8">
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
                    <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-6 py-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors pt-[10px]">
                      Take our 60-second supplement quiz →
                    </button>
                  </Link>
                </div>
              </div>

              {/* Nutritionists Image */}
              <div className="relative">
                <img
                  src={nutritionistImg}
                  alt="Professional nutritionist providing expert consultation and sharing valuable health information"
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
                <div className="flex flex-wrap gap-1">
                  <span className="bg-black text-white px-2 py-1 text-xs font-medium">All</span>
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Sleep</span>
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Energy</span>
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Beauty</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Fertility</span>
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Pregnancy</span>
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Immunity</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Stress</span>
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Gut Health</span>
                  <span className="border border-gray-300 text-gray-700 px-2 py-1 text-xs font-medium">Wellbeing</span>
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
                    <img src={magnesiumImg} alt="Healios Magnesium Complex" className="w-8 h-10 object-contain" />
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
                    <img src={ashwagandhaImg} alt="Healios Ashwagandha Energy Support" className="w-8 h-10 object-contain" />
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
            {/* Shop Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Shop</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/products?category=bestsellers" className="hover:text-white transition-colors">Bestsellers</Link></li>
                <li><Link href="/products?category=energy" className="hover:text-white transition-colors">Energy & Focus</Link></li>
                <li><Link href="/products?category=sleep" className="hover:text-white transition-colors">Sleep & Recovery</Link></li>
                <li><Link href="/products?category=immunity" className="hover:text-white transition-colors">Immune Support</Link></li>
                <li><Link href="/products?category=digestive" className="hover:text-white transition-colors">Digestive Health</Link></li>
                <li><Link href="/products?category=stress" className="hover:text-white transition-colors">Stress Management</Link></li>
              </ul>
            </div>

            {/* Learn Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Learn</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/about" className="hover:text-white transition-colors">About Healios</Link></li>
                <li><Link href="/science" className="hover:text-white transition-colors">The Science</Link></li>
                <li><Link href="/practitioners" className="hover:text-white transition-colors">For Practitioners</Link></li>
                <li><Link href="/womens-health" className="hover:text-white transition-colors">Women's Health</Link></li>
                <li><Link href="/journal" className="hover:text-white transition-colors">Healios Journal</Link></li>
                <li><Link href="/podcast" className="hover:text-white transition-colors">Healios Sessions Podcast</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Support</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/consultation" className="hover:text-white transition-colors">Book Consultation</Link></li>
                <li><Link href="/quiz" className="hover:text-white transition-colors">Supplement Quiz</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-medium mb-6">Company</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
                <li><Link href="/affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
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