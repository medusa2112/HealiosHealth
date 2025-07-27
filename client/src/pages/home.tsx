import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Star, Leaf, Award, Microscope, FlaskConical, TestTube, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo-head';
import appleCiderVinegarImg from '@assets/Apple Cider Vinegar_1753615197742.png';
import vitaminD3Img from '@assets/Vitamin D3  1000 IU_1753615197740.png';
import ashwagandhaImg from '@assets/Ashwagandha 600mg_1753615197741.png';
import probioticsImg from '@assets/Porbiotic_Vitamins_1753615197742.png';
import magnesiumImg from '@assets/Magnesium_1753615197741.png';
import wellnessVideoSrc from '@assets/Healios (3)_1753504393390.mov';
import nutritionistImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';
import healiosNatureImg from '@assets/Healios_1753559079971.png';
import healiosGummiesImg from '@assets/Screenshot 2025-07-26 at 21.46.49_1753559220742.png';
import childrenMultivitaminImg from '@assets/Multivitamin for Kids_1753615197742.png';
import collagenComplexImg from '@assets/Collagen Complex__1753615197742.png';
import { ApparelCard } from '@/components/apparel-card';
import { PreOrderModal } from '@/components/pre-order-modal';

export default function HomePage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('BESTSELLERS');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // Pre-order modal states
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedSalePrice, setSelectedSalePrice] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  // Category filtering logic for authentic Healios products only
  const categories = {
    BESTSELLERS: 'all',
    GUMMIES: ['apple-cider-vinegar', 'vitamin-d3', 'children-multivitamin', 'collagen-complex'],
    VITAMINS: ['vitamin-d3', 'children-multivitamin'],
    ADAPTOGENS: ['ashwagandha'],
    PROBIOTICS: ['probiotics', 'probiotic-vitamins'],
    MINERALS: ['magnesium'],
    APPAREL: ['healios-jumper-men', 'healios-jumper-women', 'healios-tshirt-men', 'healios-tshirt-women']
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
    if (!featuredProducts || !Array.isArray(featuredProducts)) return [];
    
    const categoryFilter = categories[selectedCategory as keyof typeof categories];
    if (categoryFilter === 'all') return featuredProducts;
    
    return featuredProducts.filter((product: any) => 
      Array.isArray(categoryFilter) && categoryFilter.includes(product.id)
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
        title="Healios - Premium Wellness Supplements | Quality Ingredients, Third-Party Tested"
        description="Discover Healios premium wellness supplements made with quality ingredients. Carefully formulated to support your daily wellness routine. Third-party tested for purity."
        keywords="wellness supplements, natural vitamins, daily wellness, premium supplements, Healios, quality ingredients, third-party tested"
        image="/attached_assets/Healios_1753559079971.png"
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
            src={healiosGummiesImg}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center bg-transparent text-white border border-white px-4 py-2 text-sm font-medium mb-8">
            Quality supplements for daily wellness support.
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
                Quality Wellness Supplements.
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 uppercase tracking-wide">
                SUPPORTING YOUR DAILY WELLNESS ROUTINE
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
                    onClick={() => handleCategoryChange('GUMMIES')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'GUMMIES' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    GUMMIES
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('VITAMINS')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'VITAMINS' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    VITAMINS
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('ADAPTOGENS')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'ADAPTOGENS' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    ADAPTOGENS
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleCategoryChange('PROBIOTICS')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'PROBIOTICS' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    PROBIOTICS
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('MINERALS')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'MINERALS' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    MINERALS
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('APPAREL')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'APPAREL' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    APPAREL
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
                    'probiotics': '/assets/Probiotics10Bil-X_1753615874344.png',
                    'magnesium': magnesiumImg,
                    'children-multivitamin': childrenMultivitaminImg,
                    'childrens-multivitamin': childrenMultivitaminImg,
                    'probiotic-vitamins': probioticsImg,
                    'collagen-complex': collagenComplexImg,
                    'healios-jumper-men': '/images/healios-jumper-men.svg',
                    'healios-jumper-women': '/images/healios-jumper-women.svg',
                    'healios-tshirt-men': '/images/healios-tshirt-men.svg',
                    'healios-tshirt-women': '/images/healios-tshirt-women.svg'
                  };

                  const productGradients = {
                    'apple-cider-vinegar': 'from-orange-100 to-yellow-200',
                    'vitamin-d3': 'from-yellow-100 to-orange-200',
                    'ashwagandha': 'from-green-100 to-teal-200',
                    'probiotics': 'from-blue-100 to-purple-200',
                    'magnesium': 'from-purple-100 to-pink-200',
                    'children-multivitamin': 'from-pink-100 to-purple-200',
                    'childrens-multivitamin': 'from-pink-100 to-purple-200',
                    'probiotic-vitamins': 'from-blue-100 to-purple-200',
                    'collagen-complex': 'from-teal-100 to-cyan-200'
                  };

                  const productBadges = {
                    'apple-cider-vinegar': 'Bestseller',
                    'vitamin-d3': 'Sale',
                    'ashwagandha': 'Adaptogen',
                    'probiotics': 'Gut Health',
                    'magnesium': 'Sleep',
                    'children-multivitamin': 'Kids',
                    'childrens-multivitamin': 'Kids',
                    'probiotic-vitamins': 'Immunity',
                    'collagen-complex': 'Beauty',
                    'healios-jumper-men': 'Performance',
                    'healios-jumper-women': 'Performance',
                    'healios-tshirt-men': 'Essential',
                    'healios-tshirt-women': 'Essential'
                  };

                  // Check if this is an apparel product
                  if (product.type === 'apparel') {
                    return (
                      <ApparelCard 
                        key={product.id} 
                        product={product}
                        badge={productBadges[product.id as keyof typeof productBadges]}
                      />
                    );
                  }

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
                          
                          {/* Pre-Order Button */}
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowPreOrderModal(true);
                              setSelectedProductName(product.name);
                              setSelectedSalePrice(product.price);
                            }}
                            className="absolute bottom-3 right-3 bg-black text-white px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Pre-Order
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
            {/* Image Section */}
            <div className="relative mb-12 lg:mb-0">
              <img
                src={healiosNatureImg}
                alt="Pure natural wellness - pristine mountain lake representing the purity and natural origins of Healios supplements"
                className="w-full aspect-video object-cover"
              />
            </div>

            {/* Content */}
            <div className="lg:pl-8">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                Why Choose Healios Supplements?
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Quality supplements designed to support your daily wellness routine with carefully selected ingredients.
              </p>

              {/* Key Benefits List */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-3">
                  <Microscope className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Carefully formulated with quality ingredients.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <TestTube className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Third-party tested for purity and quality.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Designed to support your wellness routine.
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
                  Quality wellness supplements<br />
                  designed to support your<br />
                  daily wellness routine.
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
                src={healiosGummiesImg}
                alt="Healios Apple Cider Vinegar & Ginger Gummies - premium supplement showcasing natural ingredients and professional packaging"
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
                    <span className="text-gray-700 dark:text-gray-300">Wellness goals & lifestyle support</span>
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
                  I take this supplement as part of my evening routine and find it fits well into my wellness schedule. I appreciate the quality and consistency of this product. Would recommend to others!
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
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg",
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg",
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg",
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg",
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg",
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg",
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg",
                "/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg"
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

      {/* Pre-Order Modal */}
      <PreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        productName={selectedProductName}
        productPrice={selectedSalePrice}
      />
    </div>
  );
}