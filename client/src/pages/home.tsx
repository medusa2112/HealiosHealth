import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Star, Leaf, Award, Microscope, FlaskConical, TestTube, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo-head';
import appleCiderVinegarImg from '@assets/Apple Cider Vinegar_1753615197742.png';
import vitaminD3Img from '@assets/Vitamin D3  4000 IU_1754056731371.png';
import ashwagandhaImg from '@assets/Ashwagandha 600mg_1753615197741.png';
import probioticsImg from '@assets/Porbiotic_Vitamins_1753615197742.png';
import magnesiumImg from '@assets/Magnesium_1753615197741.png';
import wellnessVideoSrc from '@assets/Healios (3)_1753504393390.mov';
import nutritionistImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';
import pharmacistsImg from '@assets/multiracial-pharmacists-mix-and-make-a-cure-in-mor-2025-04-01-13-08-39-utc (1) (1)_1753618338989.jpg';
import newPharmacistsImg from '@assets/multiracial-pharmacists-mix-and-make-a-cure-in-mor-2025-04-01-13-08-39-utc (1) (1)_1753618756171.jpg';
import childrenMultivitaminImg from '@assets/Multivitamin for Kids_1753615197742.png';
import collagenComplexImg from '@assets/Collagen Complex__1753615197742.png';

import { PreOrderModal } from '@/components/pre-order-modal';

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
  const [selectedReviewCategory, setSelectedReviewCategory] = useState('All');
  
  // Pre-order modal states
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedSalePrice, setSelectedSalePrice] = useState('');

  // Review data with categories
  const allReviews = [
    {
      id: 1,
      category: 'Minerals',
      name: 'SARAH M.',
      text: 'Started taking these after struggling with restless evenings. Within two weeks, I noticed a significant improvement in my relaxation routine. The berry flavor is pleasant and the quality is excellent.',
      product: 'Magnesium Complex',
      productLink: '/products/magnesium',
      productImage: magnesiumImg
    },
    {
      id: 2,
      category: 'Beauty',
      name: 'EMMA K.',
      text: 'My skin and nails have noticeably improved since starting these three months ago. The orange flavor makes them enjoyable to take daily. Great value for the quality you receive.',
      product: 'Collagen Complex',
      productLink: '/products/collagen-complex',
      productImage: collagenComplexImg
    },
    {
      id: 3,
      category: 'Stress',
      name: 'RACHEL P.',
      text: 'These have become part of my daily routine for stress management. I appreciate that they\'re made with traditional Ayurvedic ingredients. The strawberry flavor is a nice touch.',
      product: 'KSM-66 Ashwagandha',
      productLink: '/products/ashwagandha',
      productImage: ashwagandhaImg
    },
    {
      id: 4,
      category: 'Digestive',
      name: 'JAMES R.',
      text: 'Great for supporting my digestive routine. The pineapple flavor is refreshing and I love that it combines probiotics with essential vitamins. Quality is excellent.',
      product: 'Probiotic + Vitamins',
      productLink: '/products/probiotic-vitamins',
      productImage: probioticsImg
    },
    {
      id: 5,
      category: 'Immunity',
      name: 'LUCY H.',
      text: 'Perfect for daily immune support. The lemon flavor is delicious and it fits easily into my morning routine. Really happy with the quality and consistency.',
      product: 'Vitamin D3 4000 IU',
      productLink: '/products/vitamin-d3',
      productImage: vitaminD3Img
    },
    {
      id: 6,
      category: 'Children',
      name: 'SOPHIE T.',
      text: 'My kids actually ask for their daily vitamins now! The fruit flavors are amazing and I feel confident knowing they\'re getting quality nutrition. Highly recommend for families.',
      product: 'Children\'s Multivitamin',
      productLink: '/products/children-multivitamin',
      productImage: childrenMultivitaminImg
    },
    {
      id: 7,
      category: 'Metabolism',
      name: 'MICHAEL D.',
      text: 'I take these before meals as part of my wellness routine. The strawberry flavor makes them enjoyable and I appreciate the convenient gummy format.',
      product: 'Apple Cider Vinegar',
      productLink: '/products/apple-cider-vinegar',
      productImage: appleCiderVinegarImg
    },
    {
      id: 8,
      category: 'Energy',
      name: 'DAVID K.',
      text: 'Really helps with my afternoon energy dips. I love that it combines iron with vitamin C for better absorption. The cherry flavor is excellent.',
      product: 'Iron + Vitamin C',
      productLink: '/products/iron-vitamin-c',
      productImage: appleCiderVinegarImg // Using placeholder for now
    },
    {
      id: 9,
      category: 'Prenatal',
      name: 'JESSICA M.',
      text: 'Started taking these during pre-conception planning as recommended. The berry flavor is pleasant and they\'re easy to incorporate into my routine.',
      product: 'Folic Acid 400µg',
      productLink: '/products/folic-acid',
      productImage: appleCiderVinegarImg
    },
    {
      id: 10,
      category: 'Beauty',
      name: 'ANNA L.',
      text: 'My hairdresser noticed the difference in my hair thickness after 2 months. The strawberry flavor makes them enjoyable and the high potency formula really works.',
      product: 'Biotin 5000µg',
      productLink: '/products/biotin-5000mcg',
      productImage: collagenComplexImg
    },
    {
      id: 11,
      category: 'Immunity',
      name: 'PETER R.',
      text: 'Perfect for winter months when I need extra immune support. The lemon flavor is refreshing and the 4000 IU high-potency dose is ideal for optimal levels.',
      product: 'Vitamin D3 4000 IU',
      productLink: '/products/vitamin-d3',
      productImage: vitaminD3Img
    },
    {
      id: 12,
      category: 'Stress',
      name: 'HELEN W.',
      text: 'These have become essential for managing my hectic schedule. The adaptogenic properties really help with daily stress. Love the traditional Ayurvedic approach.',
      product: 'KSM-66 Ashwagandha',
      productLink: '/products/ashwagandha',
      productImage: ashwagandhaImg
    },
    {
      id: 13,
      category: 'Minerals',
      name: 'THOMAS B.',
      text: 'Great for post-workout recovery and evening relaxation. The berry flavor is delicious and I sleep much better since starting these. Highly recommend.',
      product: 'Magnesium Complex',
      productLink: '/products/magnesium',
      productImage: magnesiumImg
    },
    {
      id: 14,
      category: 'Digestive',
      name: 'SARAH K.',
      text: 'Love the combination of probiotics with vitamins in one gummy. The pineapple flavor is tropical and refreshing. Great for daily digestive support.',
      product: 'Probiotic + Vitamins',
      productLink: '/products/probiotic-vitamins',
      productImage: probioticsImg
    },
    {
      id: 15,
      category: 'Children',
      name: 'MARK T.',
      text: 'Finally found vitamins my picky eater will actually take! The fruit flavors are a hit and I love knowing they\'re getting comprehensive nutrition.',
      product: 'Children\'s Multivitamin',
      productLink: '/products/children-multivitamin',
      productImage: childrenMultivitaminImg
    },
    {
      id: 16,
      category: 'Metabolism',
      name: 'LISA R.',
      text: 'Much more convenient than liquid apple cider vinegar. I take these before meals and love that there\'s no harsh taste or tooth enamel concerns.',
      product: 'Apple Cider Vinegar',
      productLink: '/products/apple-cider-vinegar',
      productImage: appleCiderVinegarImg
    }
  ];

  // Filter reviews based on selected category
  const filteredReviews = selectedReviewCategory === 'All' 
    ? allReviews // Show all reviews for 'All'
    : allReviews.filter(review => review.category === selectedReviewCategory);
  
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
    GUMMIES: ['apple-cider-vinegar', 'vitamin-d3', 'children-multivitamin', 'collagen-complex', 'biotin-5000', 'folic-acid-400'],
    VITAMINS: ['vitamin-d3', 'children-multivitamin', 'folic-acid-400'],
    ADAPTOGENS: ['ashwagandha'],
    PROBIOTICS: ['probiotics', 'probiotic-vitamins'],
    MINERALS: ['magnesium', 'iron-vitamin-c'],
    BEAUTY: ['collagen-complex', 'biotin-5000'],
    PRENATAL: ['folic-acid-400'],

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
            src={newPharmacistsImg}
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
              LOVED BY THOUSANDS OF CUSTOMERS
            </div>
          </div>
        </div>

        {/* Press Mentions Footer */}
        <div className="absolute bottom-8 left-6 right-6 lg:left-12 lg:right-12">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-white text-xs font-medium opacity-70">
            <span>The Grind Fitness</span>
            <span>Eleven Eleven Sports Performance</span>
            <span>Peak Performance Nutrition</span>
            <span>Elite Wellness Studio</span>
            <span>The Grind Fitness</span>
            <span>Eleven Eleven Sports Performance</span>
            <span>Peak Performance Nutrition</span>
            <span>Elite Wellness Studio</span>
          </div>
        </div>
      </section>

      {/* Mind & Memory Mushroom Featured Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="order-2 lg:order-1 mb-12 lg:mb-0">
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  NEW ARRIVAL • PREORDER NOW
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                Mind & Memory<br />
                Mushroom
              </h2>
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl font-light text-gray-900 dark:text-white">R249.99</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(1,032 reviews)</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                Powerful daily support for brain health, focus, and cognition with 200mg 10:1 Lion's Mane extract 
                (equivalent to 2000mg dried). Premium nootropic benefits in delicious berry-flavored vegan gummies.
              </p>
              
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">2000mg</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Fruiting body equivalent</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">1 in 3</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">UK adults struggle with memory</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">60 days</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">2-month supply</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">10:1</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">High-strength extract</div>
                </div>
              </div>

              {/* Preorder Info */}
              <div className="bg-white dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Preorder Now</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">250 units arriving September 1st</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 dark:text-gray-400">Limited quantity</div>
                    <div className="text-xs font-medium text-green-600">Reserve yours today</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    setSelectedProductName('Mind & Memory Mushroom - Lion\'s Mane Gummies (2000mg)');
                    setSelectedSalePrice('R249.99');
                    setShowPreOrderModal(true);
                  }}
                  className="bg-black text-white px-8 py-4 font-medium hover:bg-gray-800 transition-colors flex-1"
                >
                  Preorder Now
                </button>
                <Link href="/products/mind-memory-mushroom">
                  <button className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Learn More →
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative bg-white dark:bg-gray-200 aspect-square flex items-center justify-center">
                {/* Placeholder for Lions Mane product image */}
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center mb-4">
                    <span className="text-4xl">🍄</span>
                  </div>
                  <div className="text-sm text-gray-600">Lion's Mane Gummies</div>
                  <div className="text-xs text-gray-500">Premium Brain Support</div>
                </div>
              </div>
            </div>
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
                    'vitamin-d3': 'Sale',
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
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              src={newPharmacistsImg}
              alt="Professional multiracial pharmacists and scientists collaborating in modern laboratory, developing quality supplements and wellness solutions"
              className="w-full h-full min-h-[400px] lg:min-h-full object-cover"
            />
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
                  Trusted by our<br />
                  growing community
                </h2>
              </div>

              {/* Category Pills */}
              <div className="space-y-2 mb-8">
                <div className="flex flex-wrap gap-1">
                  {['All', 'Energy', 'Beauty', 'Digestive'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedReviewCategory(category)}
                      className={`px-2 py-1 text-xs font-medium transition-colors ${
                        selectedReviewCategory === category
                          ? 'bg-black text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Prenatal', 'Children', 'Immunity'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedReviewCategory(category)}
                      className={`px-2 py-1 text-xs font-medium transition-colors ${
                        selectedReviewCategory === category
                          ? 'bg-black text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {['Stress', 'Minerals', 'Metabolism'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedReviewCategory(category)}
                      className={`px-2 py-1 text-xs font-medium transition-colors ${
                        selectedReviewCategory === category
                          ? 'bg-black text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <Link href="/products">
                <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                  Shop bestsellers →
                </button>
              </Link>
            </div>

            {/* Reviews Grid */}
            <div className={`lg:col-span-3 ${selectedReviewCategory === 'All' 
              ? 'flex gap-6 overflow-x-auto pb-4 scrollbar-hide' 
              : 'grid grid-cols-1 lg:grid-cols-3 gap-6'
            }`}>
              {filteredReviews.map((review) => (
                <div key={review.id} className={`bg-white dark:bg-gray-700 p-6 ${
                  selectedReviewCategory === 'All' ? 'flex-shrink-0 w-80' : ''
                }`}>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {review.text}
                  </p>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{review.name}</p>
                    <Link href={review.productLink}>
                      <div className="cursor-pointer hover:opacity-80 transition-opacity">
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{review.product}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">View product</p>
                      </div>
                    </Link>
                  </div>
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
            Join our community for wellness tips and exclusive offers
          </p>

          <form className="space-y-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Last name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <input
              type="text"
              placeholder="Your Birthday"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-6 font-medium hover:bg-white hover:text-black hover:border-black border border-black transition-colors"
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
        productId="sample-product"
      />
    </div>
  );
}