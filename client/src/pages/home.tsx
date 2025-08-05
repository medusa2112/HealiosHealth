import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Star, Leaf, Award, Microscope, FlaskConical, TestTube, Lightbulb, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo-head';
import appleCiderVinegarImg from '@assets/healios-health2.png';
import vitaminD3Img from '@assets/healios-health127.png';
import ashwagandhaImg from '@assets/healios-health3.png';
import probioticsImg from '@assets/healios-health75.png';
import magnesiumImg from '@assets/healios-health44.png';
import wellnessVideoSrc from '@assets/Healios (3)_1753504393390.mov';
import nutritionistImg from '@assets/healios-health31.jpg';
import pharmacistsImg from '@assets/healios-health48.jpg';
import modernLabImg from '@assets/generated_images/Modern_pharmaceutical_research_facility_b73898e1.png';
import childrenMultivitaminImg from '@assets/healios-health49.png';
import collagenComplexImg from '@assets/healios-health11.png';
import haloGlowTextImg from '@assets/HaloGlow_1754394641788.png';

import { PreOrderModal } from '@/components/pre-order-modal';

// Newsletter Form Component
const NewsletterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your first name, last name, and email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Welcome to Healios!",
          description: "You've successfully joined our wellness community. Check your email for confirmation."
        });
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          birthday: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to subscribe');
      }
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required
        />
        <input
          type="text"
          placeholder="Last name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required
        />
      </div>

      <input
        type="email"
        placeholder="Email address"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        required
      />

      <div className="relative">
        <input
          type="date"
          placeholder="DD/MM/YYYY"
          value={formData.birthday}
          onChange={(e) => setFormData({...formData, birthday: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white [color-scheme:dark]"
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
        />
        <label className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">Birthday (Optional)</label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3 px-6 font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Signing up...' : 'Sign up now'}
      </button>
    </form>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`border border-black cursor-pointer transition-colors ${
        isOpen 
          ? 'bg-white text-black border-black' 
          : 'bg-white text-black border-black hover:bg-black hover:text-white'
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-medium pr-4">
            {question}
          </h3>
          <div className={`text-sm transition-transform ${isOpen ? 'rotate-45' : ''}`}>
            +
          </div>
        </div>
        
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-700">
              {answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function HomePage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('BESTSELLERS');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null); // For geo-restriction

  // Geo-location detection for HALO Glow RSA restriction
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Using a simple IP geolocation service
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserCountry(data.country_code);
      } catch (error) {
        console.error('Geolocation detection failed:', error);
        // Default to showing product if geolocation fails
        setUserCountry('ZA');
      }
    };
    detectCountry();
  }, []);
  
  // Pre-order modal states
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedSalePrice, setSelectedSalePrice] = useState('');


  
  // Removed animation state for fitness video - now static display
  
  // Animation state for right image (Science section)
  const [rightImageTransform, setRightImageTransform] = useState('translateX(100px) scale(0.95)');
  const [rightHasReachedCenter, setRightHasReachedCenter] = useState(false);
  const rightImageRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Removed intersection observer for fitness video animation - now static display

  // Intersection Observer for right image animation (Science section)
  useEffect(() => {
    const rightImageElement = rightImageRef.current;
    if (!rightImageElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rect = entry.boundingClientRect;
          const windowHeight = window.innerHeight;
          const elementCenter = rect.top + rect.height / 2;
          const windowCenter = windowHeight / 2;
          
          if (entry.isIntersecting) {
            // Calculate progress based on how close element center is to window center
            const distanceFromCenter = Math.abs(elementCenter - windowCenter);
            const maxDistance = windowHeight / 2;
            const progress = Math.max(0, 1 - (distanceFromCenter / maxDistance));
            
            // Check if we've reached the center (progress > 0.8 means very close to center)
            if (progress > 0.8 && !rightHasReachedCenter) {
              setRightHasReachedCenter(true);
            }
            
            // Only animate if we haven't reached center yet, otherwise keep final position
            if (!rightHasReachedCenter) {
              // Smooth easing function
              const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
              const easedProgress = easeOutCubic(progress);
              
              // Calculate transforms based on progress (slide from right, so positive to 0)
              const translateX = 100 - (easedProgress * 100); // From 100px to 0px
              const scale = 0.95 + (easedProgress * 0.05); // From 0.95 to 1.0
              const opacity = 0.7 + (easedProgress * 0.3); // From 0.7 to 1.0
              
              setRightImageTransform(`translateX(${translateX}px) scale(${scale})`);
              rightImageElement.style.opacity = opacity.toString();
            } else {
              // Keep final position once center is reached
              setRightImageTransform('translateX(0px) scale(1.0)');
              rightImageElement.style.opacity = '1.0';
            }
          } else if (!rightHasReachedCenter) {
            // Only reset if we haven't reached center yet
            setRightImageTransform('translateX(100px) scale(0.95)');
            rightImageElement.style.opacity = '0.7';
          }
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Fine-grained thresholds
        rootMargin: '-10% 0px -10% 0px' // Start animation slightly before entering viewport
      }
    );

    observer.observe(rightImageElement);

    return () => observer.disconnect();
  }, [rightHasReachedCenter]);

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  // Category filtering logic for authentic Healios products only
  const categories = {
    BESTSELLERS: 'all',
    GUMMIES: ['apple-cider-vinegar', 'vitamin-d3', 'childrens-multivitamin', 'collagen-complex', 'biotin-5000', 'folic-acid-400', 'magnesium', 'iron-vitamin-c', 'probiotic-vitamins', 'mind-memory-mushroom', 'bio-cultures-vitamin-plus'],
    VITAMINS: ['vitamin-d3', 'childrens-multivitamin', 'folic-acid-400', 'bio-cultures-vitamin-plus'],
    ADAPTOGENS: ['ashwagandha', 'mind-memory-mushroom'],
    PROBIOTICS: ['probiotics', 'probiotic-vitamins', 'bio-cultures-vitamin-plus'],
    MINERALS: ['magnesium', 'iron-vitamin-c'],
    BEAUTY: ['collagen-complex', 'biotin-5000', 'collagen-powder'],
    PRENATAL: ['folic-acid-400'],
    APPAREL: ['healios-oversized-tee'],
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
    let filteredProducts = categoryFilter === 'all' 
      ? featuredProducts 
      : featuredProducts.filter((product: any) => 
          Array.isArray(categoryFilter) && categoryFilter.includes(product.id)
        );
    
    // Sort products: in-stock items first, then out-of-stock
    return filteredProducts.sort((a: any, b: any) => {
      const aInStock = a.inStock && a.stockQuantity > 0;
      const bInStock = b.inStock && b.stockQuantity > 0;
      
      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;
      return 0;
    });
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
        image="/assets/healios-health27.png"
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
            src={modernLabImg}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto py-8 sm:py-0">
          {/* Badge */}
          <div className="inline-flex items-center bg-transparent text-white border border-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            Quality supplements for daily wellness support.
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-8 sm:mb-12">
            Feel Better.
            <br />
            <em className="font-light italic">Every day</em>
          </h1>

          {/* CTA Buttons */}
          <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link href="/products">
              <button className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-medium text-base sm:text-lg border border-black hover:bg-white hover:text-black hover:border-black transition-colors focus:outline-none focus:ring-2 focus:ring-white w-full sm:w-auto">
                Explore The Range
              </button>
            </Link>
            <Link href="/quiz">
              <button className="border border-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 font-medium text-base sm:text-lg bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-auto">
                Take a Quiz
              </button>
            </Link>
          </div>

          {/* Rating and Customer Count */}
          <div className="mb-16 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-white text-white" />
                ))}
              </div>
              <span className="font-medium text-sm sm:text-base">4.48 RATING</span>
              {/* Trustpilot and Google Review Icons */}
              <div className="flex items-center gap-2 ml-3">
                <a 
                  href="https://www.trustpilot.com/review/thehealios.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Read our Trustpilot reviews"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L15.09 8.54L24 8.54L17.46 13.82L20.18 22.36L12 17.77L3.82 22.36L6.54 13.82L0 8.54L8.91 8.54L12 0Z" fill="#00B67A"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Read our Google reviews"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="text-xs opacity-80">
              LOVED BY OUR CUSTOMERS
            </div>
          </div>
        </div>

        {/* Press Mentions Footer */}
        <div className="absolute bottom-4 sm:bottom-8 left-4 right-4 sm:left-6 sm:right-6 lg:left-12 lg:right-12">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-16 text-white text-xs font-medium opacity-70">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-center hover:opacity-100 transition-opacity cursor-pointer">The Grind Fitness</a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-center hover:opacity-100 transition-opacity cursor-pointer">Eleven Eleven Sports Performance</a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-center hover:opacity-100 transition-opacity cursor-pointer">Peak Performance Nutrition</a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-center hover:opacity-100 transition-opacity cursor-pointer">Elite Wellness Studio</a>
          </div>
        </div>
      </section>
      {/* Halo Glow Collagen Featured Section - Only for RSA visitors */}
      {userCountry === 'ZA' && (
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <img 
                    src="/assets/healios-health20.png"
                    alt="Halo Glow Collagen Complex"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-8">
                <div>
                  <div className="inline-block bg-green-600 text-white px-3 py-1 text-xs font-medium uppercase tracking-wider mb-3">
                    New Launch
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <img 
                      src={haloGlowTextImg} 
                      alt="HALO Glow Collagen Product" 
                      className="h-12 lg:h-16 object-contain"
                    />
                    Collagen Powder
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    Support your skin's natural radiance with HALO Glow Collagen — a daily high-purity peptide powder that boosts collagen and elastin production, reduces wrinkles and fine lines, and supports nail strength and hair thickness.
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">R429</span>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <div>30-day supply</div>
                    <div>Free shipping over R500</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 py-6 border-y border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">2500mg</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Daily dose</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">90 days</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visible results</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 dark:text-white mb-2">Marine</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Collagen source</div>
                  </div>
                </div>

                <Link href="/products/collagen-powder">
                  <button className="w-full bg-black text-white py-4 px-8 font-medium hover:bg-gray-800 transition-colors">
                    Add to Cart
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
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
                    onClick={() => handleCategoryChange('BEAUTY')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'BEAUTY' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    BEAUTY
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('PRENATAL')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === 'PRENATAL' 
                        ? 'bg-black text-white' 
                        : 'border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    PRENATAL
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
                    'vitamin-d3': 'Popular',
                    'ashwagandha': 'Adaptogen',
                    'probiotics': 'Gut Health',
                    'magnesium': 'Sleep',
                    'children-multivitamin': 'Kids',
                    'childrens-multivitamin': 'Kids',
                    'probiotic-vitamins': 'Immunity',
                    'collagen-complex': 'Beauty',
                    'biotin-5000': 'Hair & Skin',
                    'iron-vitamin-c': 'Energy',
                    'folic-acid-400': 'Prenatal',
                    'mind-memory-mushroom': 'Focus',
                    'collagen-powder': 'Premium',
                    'bio-cultures-vitamin-plus': 'Multi-Benefit',
                    'healios-oversized-tee': 'Lifestyle',
                  };



                  return (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <div className={`group cursor-pointer ${!(product.inStock && product.stockQuantity > 0) ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : ''} transition-all duration-300`} itemScope itemType="https://schema.org/Product">
                        {/* Clean White Background for Products - Wild Nutrition Style */}
                        <div className="relative bg-gray-50 dark:bg-gray-800 mb-6 aspect-square overflow-hidden group-hover:shadow-lg transition-all duration-300">
                          {/* Supply Badge - Top Left - Only for supplements */}
                          {product.type === 'supplement' && product.supplyDays && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className="bg-white text-black px-3 py-1 text-xs font-medium">
                                {product.supplyDays >= 60 ? `${Math.round(product.supplyDays / 30)}-month` : `${product.supplyDays}-day`} supply
                              </span>
                            </div>
                          )}

                          {/* Product Image */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${!(product.inStock && product.stockQuantity > 0) ? 'group-hover:filter-none' : ''}`}
                            itemProp="image"
                          />
                          
                          {/* Dynamic Action Button */}
                          {product.inStock && product.stockQuantity > 0 ? (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // TODO: Implement add to cart functionality
                                console.log('Add to cart:', product.name);
                              }}
                              className="absolute bottom-3 right-3 bg-black text-white px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowPreOrderModal(true);
                                setSelectedProductName(product.name);
                                setSelectedSalePrice(product.price);
                              }}
                              className="absolute bottom-3 right-3 bg-gray-600 text-white px-3 py-2 text-xs font-medium hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Pre-Order
                            </button>
                          )}
                        </div>
                        
                        {/* Product Info - Wild Nutrition Clean Style */}
                        <div className="space-y-2">
                          {/* Product Badge */}
                          <div className="inline-block bg-black text-white px-2 py-1 text-xs font-medium">
                            {productBadges[product.id as keyof typeof productBadges]}
                          </div>
                          
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-healios-cyan transition-colors" itemProp="name">
                            {product.name}
                          </h3>
                          
                          {/* Price and Stock Status */}
                          <div className="text-sm text-gray-800 dark:text-gray-200 font-medium" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                            <span itemProp="price" content={product.price}>R{product.price}</span>
                            <meta itemProp="priceCurrency" content="ZAR" />
                            <meta itemProp="availability" content={product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                          </div>
                          
                          {/* Dynamic Stock Status */}
                          <div className="text-xs">
                            {product.inStock && product.stockQuantity > 0 ? (
                              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {product.stockQuantity > 5 ? 'In Stock - Ready to Ship' : `Only ${product.stockQuantity} left in stock`}
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Out of Stock
                              </span>
                            )}
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
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="lg:grid lg:grid-cols-2 lg:items-stretch min-h-[600px]">
          {/* Video Column */}
          <div className="relative overflow-hidden min-h-[600px] lg:h-full bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              onLoadStart={() => console.log('TheFourths video loading started')}
              onCanPlay={() => console.log('TheFourths video can play')}
              onLoadedData={() => console.log('TheFourths video loaded')}
              onError={(e) => console.error('TheFourths video error:', e)}
            >
              <source src="/assets/TheFourths_1753620348483.mov" type="video/quicktime" />
              <source src="/assets/TheFourths_1753620348483.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Content */}
          <div className="py-24 px-6 lg:px-16 flex items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                Why Choose Healios Supplements?
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We don't promise miracles. We fix what's missing - with the nutrients your body's begging for.
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

              {/* FAQ Items */}
              <div className="mt-8 space-y-4">
                <FAQItem 
                  question="What makes Healios supplements different?"
                  answer="Our supplements are formulated with premium ingredients and are third-party tested for purity. We focus on quality and transparency in every product we create."
                />
                <FAQItem 
                  question="Are your supplements suitable for vegetarians?"
                  answer="Most of our gummy supplements are suitable for vegetarians. Please check individual product pages for specific dietary information and certifications."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* The Healios Science Section */}
      <section className="bg-white dark:bg-gray-900">
        <div className="lg:grid lg:grid-cols-2 lg:items-stretch min-h-[600px]">
          {/* Content */}
          <div className="py-24 px-6 lg:px-16 flex items-center">
            <div>
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  THE HEALIOS DIFFERENCE
                </p>
                <h2 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                  Premium gummy supplements<br />
                  manufactured to GMP standards<br />
                  for optimal wellness support.
                </h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-3">GMP</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-relaxed">
                    Certified<br />
                    Manufacturing
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-3">12</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-relaxed">
                    Premium<br />
                    Formulations
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-3">UK</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-relaxed">
                    Quality<br />
                    Standards
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-3">100%</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-relaxed">
                    Third-Party<br />
                    Tested
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
          </div>

          {/* Image - Extends to right edge and bottom */}
          <div 
            ref={rightImageRef}
            className="relative overflow-hidden"
            style={{
              transform: rightImageTransform,
              transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
              opacity: 0.7
            }}
          >
            <img
              src={modernLabImg}
              alt="Modern pharmaceutical research facility with premium supplement ingredients and scientific equipment"
              className="w-full h-full min-h-[400px] lg:min-h-full object-cover"
            />
          </div>
        </div>
      </section>
      {/* Customer Trust Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            {/* Review Platform Icons */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#00B67A">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400 ml-3">4.48 RATING</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6">EXCELLENT</p>

            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-6">
              Trusted by our growing community
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              We're committed to transparency and quality. Our supplements are formulated with premium ingredients and third-party tested for purity.
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="https://www.google.com/search?sca_esv=5f6572bf4e7c5530&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E9hyiDaxlHi6yTllTf13HcFy-ebxG-ErF5wudlZUTlOPE6XwO-AgA9T2QZOW5mUstjnx6ha9hdQWMO3J2ti0PbuwfDfyA-syirtsKifkkg_JsoSH4P6Bfmmzk9fsSs86AfVOGbg%3D&q=The+Healios+Health+Ltd.+South+Africa+Reviews&sa=X&ved=2ahUKEwic2tG84vCOAxXJQkEAHfj9DlUQ0bkNegQINRAE&biw=1845&bih=938&dpr=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              View Google Reviews
            </a>
            <a
              href="https://www.trustpilot.com/review/thehealios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              View Trustpilot Reviews
            </a>
          </div>

          <Link href="/products">
            <button className="bg-black text-white px-8 py-4 text-sm font-medium hover:bg-gray-800 transition-colors">
              Shop Healios supplements →
            </button>
          </Link>
        </div>
      </section>
      {/* Newsletter Signup Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-4">
            Join the Healios community
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join our community for wellness tips and exclusive offers
          </p>

          <NewsletterForm />
        </div>
      </section>
      {/* Pre-Order Modal */}
      <PreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        productName={selectedProductName}
        productId="sample-product"
      />
    </div>
  );
}