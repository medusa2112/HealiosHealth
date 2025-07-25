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
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          {/* Food-Grown Badge */}
          <div className="inline-flex items-center bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium mb-8">
            Food-Grown® Supplements - Better absorbed, Better retained
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight mb-8">
            Find balance.
            <br />
            <em className="font-light italic">Stay wild</em>
          </h1>
          
          {/* CTA Button */}
          <div className="mb-12">
            <Link href="/products">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white">
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
                Award-winning<br />
                women's supplements
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 uppercase tracking-wide">
                EVERY LIFE STAGE, EVERY HEALTH GOAL
              </p>
              
              {/* Category Pills */}
              <div className="space-y-2 mb-8">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-black text-white px-3 py-1 text-xs font-medium">BESTSELLERS</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">FERTILITY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">ENERGY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">PREGNANCY</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">HORMONES</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">GUT HEALTH</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">SLEEP</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">PERIMENOPAUSE</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">BEAUTY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">STRESS</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">IMMUNITY</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium">MENOPAUSE</span>
                </div>
              </div>
              
              <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                See full collection →
              </button>
            </div>
            
            {/* Product Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Product 1 - Vitamin D Gummies */}
              <div className="group" itemScope itemType="https://schema.org/Product">
                <div className="relative bg-gradient-to-br from-pink-100 to-red-200 rounded-lg p-8 mb-4 aspect-square flex items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs font-medium">
                    NEW FORMULA
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                    alt="Children's Food-Grown® Vitamin D Gummies"
                    className="w-32 h-40 object-contain"
                    itemProp="image"
                  />
                  <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                    +Add
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1" itemProp="name">
                  Children's Food-Grown® Vitamin D Gummies
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  From <span itemProp="price" content="16.00">£16.00</span>
                  <meta itemProp="priceCurrency" content="GBP" />
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                  <li>✓ Immune support</li>
                  <li>✓ Bone, muscles + teeth</li>
                  <li>✓ Certified Vegan</li>
                </ul>
              </div>

              {/* Product 2 - Adult Vitamin D */}
              <div className="group" itemScope itemType="https://schema.org/Product">
                <div className="relative bg-gray-100 rounded-lg p-8 mb-4 aspect-square flex items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-xs font-medium">
                    NEW FORMULA
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                    alt="Food-Grown® Vitamin D Gummies"
                    className="w-32 h-40 object-contain"
                    itemProp="image"
                  />
                  <button className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
                    +Add
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1" itemProp="name">
                  Food-Grown® Vitamin D Gummies
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  From <span itemProp="price" content="16.00">£16.00</span>
                  <meta itemProp="priceCurrency" content="GBP" />
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                  <li>✓ Immune support</li>
                  <li>✓ Bone, muscles + teeth</li>
                  <li>✓ Certified vegan</li>
                </ul>
              </div>

              {/* Product 3 - Weight Management (Sold Out) */}
              <div className="group" itemScope itemType="https://schema.org/Product">
                <div className="relative bg-amber-50 rounded-lg p-8 mb-4 aspect-square flex items-center justify-center">
                  <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 text-xs font-medium">
                    SOLD OUT
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                    alt="Weight Management Support"
                    className="w-24 h-32 object-contain opacity-75"
                    itemProp="image"
                  />
                  <button className="absolute bottom-4 right-4 bg-gray-600 text-white px-4 py-2 text-sm font-medium cursor-not-allowed">
                    Join The Wait List
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1" itemProp="name">
                  Weight Management Support
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="price" content="45.00">£45.00</span>
                  <meta itemProp="priceCurrency" content="GBP" />
                  <meta itemProp="availability" content="https://schema.org/OutOfStock" />
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1" itemProp="description">
                  <li>✓ Metabolic function*</li>
                  <li>✓ Fibre 24.5g per sachette*</li>
                  <li>✓ Blood glucose levels*</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pregnancy & New Mother Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Image Grid */}
            <div className="relative mb-12 lg:mb-0">
              <div className="grid grid-cols-2 gap-4">
                {/* Top left - Pregnant woman with supplement */}
                <div className="aspect-square bg-amber-100 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                    alt="Pregnant woman holding Wild Nutrition supplement bottle"
                    className="w-full h-full object-cover"
                  />
                  {/* Supplement bottle overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="w-16 h-20 bg-amber-800 rounded-lg flex items-center justify-center">
                      <div className="w-12 h-16 bg-amber-900 rounded opacity-80"></div>
                    </div>
                  </div>
                </div>
                
                {/* Top right - Baby hair close-up */}
                <div className="aspect-square bg-amber-50 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                    alt="Beautiful newborn baby hair texture"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Bottom left - Belly/bump */}
                <div className="aspect-square bg-peach-100 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                    alt="Expecting mother's belly bump"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Bottom right - More baby hair */}
                <div className="aspect-square bg-amber-50 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&fit=facearea&facepad=2"
                    alt="Soft baby hair close-up detail"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="lg:pl-8">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white leading-tight mb-6">
                For the roots of <em className="italic">new</em> life
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Science-backed, nutritionist formulated Food-Grown® supplements to 
                nourish your body's mind so you can nourish your baby's.
              </p>
              
              <Link href="/products?category=pregnancy">
                <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                  Shop Pregnancy + New Mother range →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}