import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Leaf, Microscope, Award } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SEOHead } from "@/components/seo-head";

export default function Home() {
  const { toast } = useToast();

  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email });
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Food-Grown® Supplements | Premium Natural Vitamins",
    "description": "Shop Food-Grown® supplements with 113% better absorption. Premium natural vitamins, fertility support, magnesium & more. Trusted by 300,000+ customers.",
    "url": "https://wildclone.com",
    "mainEntity": {
      "@type": "Organization",
      "name": "WildClone",
      "description": "Premium Food-Grown® supplements with superior absorption",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.84",
        "reviewCount": "300000"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://wildclone.com"
        }
      ]
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What makes Food-Grown® supplements different from regular vitamins?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Food-Grown® supplements are created through a unique fermentation process that produces nutrients in their most bioactive form. Unlike synthetic vitamins that are chemically manufactured, our supplements contain natural cofactors and enzymes that enhance absorption by 113% compared to synthetic alternatives."
        }
      },
      {
        "@type": "Question",
        "name": "Are your supplements suitable for vegans and vegetarians?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, many of our supplements are certified vegan and suitable for vegetarians. All our Food-Grown® vitamins are produced through plant-based fermentation processes, and we clearly label which products are vegan-certified on each product page."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to see results from your supplements?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Results vary by individual and supplement type. Our magnesium supplement typically shows sleep improvements within 1-2 weeks, while fertility support supplements may take 3-6 months for optimal results. Energy and immune support supplements often show benefits within 2-4 weeks of consistent use."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer free shipping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer free shipping on orders over $50 within the United States. International shipping rates apply for orders outside the US. All orders are processed within 1-2 business days and typically arrive within 3-5 business days."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Food-Grown® Supplements | Premium Natural Vitamins | WildClone"
        description="Shop Food-Grown® supplements with 113% better absorption. Premium natural vitamins, fertility support, magnesium & more. Trusted by 300,000+ customers. Free shipping on orders $50+."
        keywords="food grown supplements, natural vitamins, magnesium supplement, fertility support, vitamin D, collagen, organic supplements, better absorption vitamins, wild nutrition alternative, vegan supplements, third party tested vitamins"
        structuredData={[homeStructuredData, faqStructuredData]}
      />
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 py-16 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center bg-brandYellow/10 dark:bg-brandYellow/20 text-darkText dark:text-brandYellow px-4 py-2 rounded-full text-sm font-medium mb-6">
              Shop Food-Grown® supplements
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-brandYellow">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i} className="text-lg">{star}</span>
                ))}
              </div>
              <span className="font-heading text-lg font-bold text-darkText dark:text-white">4.84</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-12">
              Loved by 300,000+ customers
            </p>
            
            {/* Press Logos */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-16 opacity-60">
              <div className="text-gray-500 dark:text-gray-400 font-medium text-sm">Grazia</div>
              <div className="text-gray-500 dark:text-gray-400 font-medium text-sm">The Telegraph</div>
              <div className="text-gray-500 dark:text-gray-400 font-medium text-sm">Vogue</div>
              <div className="text-gray-500 dark:text-gray-400 font-medium text-sm">Women's Health</div>
            </div>
            
            {/* Main Hero Content */}
            <div className="max-w-4xl mx-auto">
              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-darkText dark:text-white leading-tight mb-8">
                EVERY LIFE STAGE,
                <br />
                <span className="text-brandYellow">EVERY HEALTH GOAL</span>
              </h1>
              
              {/* SEO-Rich Subtitle */}
              <h2 className="font-body text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Premium Food-Grown® Supplements with 113% Better Absorption | Natural Vitamins for Fertility, Energy, Sleep & Immunity
              </h2>
              
              {/* Trust Signals for SEO */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Third-Party Tested
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Certified Vegan
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free Shipping $50+
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  30-Day Guarantee
                </span>
              </div>
              
              {/* Category Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {[
                  "Bestsellers", "Fertility", "Energy", "Pregnancy", "Hormones", 
                  "Gut Health", "Sleep", "Perimenopause", "Beauty", "Stress", 
                  "Immunity", "Menopause"
                ].map((category) => (
                  <span 
                    key={category}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-darkText dark:text-gray-300 rounded-full text-sm font-medium hover:bg-brandYellow hover:text-darkText transition-colors cursor-pointer"
                  >
                    {category}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <button className="bg-brandYellow text-darkText px-8 py-4 rounded-full font-semibold text-lg hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow">
                    Shop Now
                  </button>
                </Link>
                <Link href="/science">
                  <button className="border-2 border-darkText dark:border-white text-darkText dark:text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-darkText hover:text-white dark:hover:bg-white dark:hover:text-darkText transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product Card 1 - Food-Grown® Magnesium */}
            <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300" itemScope itemType="https://schema.org/Product">
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-700">
                <div className="absolute top-3 left-3 bg-brandYellow text-darkText text-xs font-bold px-2 py-1 rounded-full">
                  Bestseller
                </div>
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  alt="Food-Grown® Magnesium supplement bottle for better sleep and reduced fatigue"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  itemProp="image"
                />
              </div>
              <div className="p-4">
                <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  (<span itemProp="reviewCount">305</span> Reviews)
                  <meta itemProp="ratingValue" content="4.8" />
                  <meta itemProp="bestRating" content="5" />
                </div>
                <h3 className="font-heading text-base font-semibold text-darkText dark:text-white mb-2" itemProp="name">
                  Food-Grown® Magnesium
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">$27.00</span>
                  <span className="font-bold text-darkText dark:text-white" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span itemProp="price" content="21.60">From $21.60</span>
                    <meta itemProp="priceCurrency" content="USD" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </span>
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded">-20%</span>
                </div>
                <ul className="space-y-1 mb-4" itemProp="description">
                  <li className="text-sm text-gray-600 dark:text-gray-400">• 42 minutes extra sleep</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Reduction of tiredness + fatigue</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Psychological function</li>
                </ul>
                <button className="w-full bg-brandYellow text-darkText px-4 py-2 rounded text-sm font-semibold hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow" aria-label="Add Food-Grown® Magnesium to cart">
                  +Add
                </button>
              </div>
            </div>

            {/* Product Card 2 - Collagen 500 Plus */}
            <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-700">
                <div className="absolute top-3 left-3 bg-brandYellow text-darkText text-xs font-bold px-2 py-1 rounded-full">
                  Bestseller
                </div>
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  alt="Collagen 500 Plus supplement for women's collagen support and skin health"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">(276 Reviews)</div>
                <h3 className="font-heading text-base font-semibold text-darkText dark:text-white mb-2">
                  Collagen 500 Plus
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">$48.00</span>
                  <span className="font-bold text-darkText dark:text-white">From $38.40</span>
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded">-20%</span>
                </div>
                <ul className="space-y-1 mb-4">
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Collagen formation</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Decreases appearance of wrinkles</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Optimally-absorbed 500 Daltons</li>
                </ul>
                <button className="w-full bg-brandYellow text-darkText px-4 py-2 rounded text-sm font-semibold hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow">
                  +Add
                </button>
              </div>
            </div>

            {/* Product Card 3 - Food-Grown® Fertility Support */}
            <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-700">
                <div className="absolute top-3 left-3 bg-brandYellow text-darkText text-xs font-bold px-2 py-1 rounded-full">
                  Bestseller
                </div>
                <img
                  src="https://images.unsplash.com/photo-1609501676725-7186f734cd16?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  alt="Food-Grown® Fertility Support for Women supplement for hormone support"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">(115 Reviews)</div>
                <h3 className="font-heading text-base font-semibold text-darkText dark:text-white mb-2">
                  Food-Grown® Fertility Support for Women
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">$55.00</span>
                  <span className="font-bold text-darkText dark:text-white">From $44.00</span>
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded">-20%</span>
                </div>
                <ul className="space-y-1 mb-4">
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Hormone support</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Supports fertility & reproduction</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Mental resilience</li>
                </ul>
                <button className="w-full bg-brandYellow text-darkText px-4 py-2 rounded text-sm font-semibold hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow">
                  +Add
                </button>
              </div>
            </div>

            {/* Product Card 4 - Food-Grown® Vitamin D */}
            <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-700">
                <div className="absolute top-3 left-3 bg-brandYellow text-darkText text-xs font-bold px-2 py-1 rounded-full">
                  Bestseller
                </div>
                <img
                  src="https://images.unsplash.com/photo-1584017911766-d451b3d0e843?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  alt="Food-Grown® Vitamin D supplement for immune support and bone health"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">(102 Reviews)</div>
                <h3 className="font-heading text-base font-semibold text-darkText dark:text-white mb-2">
                  Food-Grown® Vitamin D
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">$24.00</span>
                  <span className="font-bold text-darkText dark:text-white">From $19.20</span>
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded">-20%</span>
                </div>
                <ul className="space-y-1 mb-4">
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Immune support</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• Supports bones & teeth</li>
                  <li className="text-sm text-gray-600 dark:text-gray-400">• 113% better absorbed</li>
                </ul>
                <button className="w-full bg-brandYellow text-darkText px-4 py-2 rounded text-sm font-semibold hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brandYellow">
                  +Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Food-Grown® Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-darkText dark:text-white mb-4">
              Why Food-Grown®?
            </h2>
            <p className="max-w-prose mx-auto text-base text-gray-600 dark:text-gray-400">
              Our revolutionary Food-Grown® process creates nutrients that your body recognizes and absorbs more effectively. 
              It's not just what we put in, it's how your body takes it out.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="text-darkText text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-2">
                    113% Better Absorbed*
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our Food-Grown® vitamins are proven to be significantly better absorbed than synthetic alternatives, meaning more nutrition for your body.
                  </p>
                </div>
              </li>
              
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="text-darkText text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-2">
                    Gentle on Your Stomach
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Unlike synthetic vitamins that can cause nausea, our Food-Grown® nutrients are gentle and can be taken on an empty stomach.
                  </p>
                </div>
              </li>
              
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="text-darkText text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-2">
                    Scientifically Proven Process
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our unique fermentation process creates vitamins in their most bioactive form, complete with natural cofactors and enzymes.
                  </p>
                </div>
              </li>
            </ul>
            
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="text-darkText text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-2">
                    Third-Party Tested
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Every batch is independently tested for purity, potency and heavy metals to ensure the highest quality and safety standards.
                  </p>
                </div>
              </li>
              
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="text-darkText text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-2">
                    Certified Vegan & Organic
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Many of our supplements are certified organic and suitable for vegans, made without artificial additives or preservatives.
                  </p>
                </div>
              </li>
              
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                  <span className="text-darkText text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-2">
                    Trusted by Practitioners
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Recommended by nutritionists, naturopaths and healthcare professionals for over 30 years of expertise in natural health.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              *Based on independent studies comparing Food-Grown® vitamins to synthetic alternatives
            </p>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-darkText dark:text-white mb-6 text-center">
              The Science Behind Food-Grown® Supplements
            </h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                <strong>Food-Grown® supplements</strong> represent a revolutionary approach to nutrition that addresses the fundamental problem with synthetic vitamins: poor absorption and bioavailability. Unlike traditional supplements that are chemically manufactured, our Food-Grown® process creates nutrients through fermentation, resulting in vitamins and minerals that your body recognizes as food.
              </p>
              
              <h3 className="font-heading text-xl font-semibold text-darkText dark:text-white mb-4">
                Why Choose Food-Grown® Over Synthetic Vitamins?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Research consistently shows that <strong>Food-Grown® vitamins are absorbed 113% better</strong> than their synthetic counterparts. This superior absorption means you get more nutritional value from each dose, making our supplements more effective and cost-efficient. Traditional synthetic vitamins often pass through your system largely unused, while Food-Grown® nutrients are readily recognized and utilized by your body.
              </p>
              
              <h3 className="font-heading text-xl font-semibold text-darkText dark:text-white mb-4">
                Clinical Evidence and Third-Party Testing
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Every batch of our <strong>premium natural vitamins</strong> undergoes rigorous third-party testing for purity, potency, and heavy metals. Our <strong>magnesium supplement</strong> has been clinically shown to provide an additional 42 minutes of sleep per night, while our <strong>fertility support supplements</strong> have helped thousands of couples on their journey to parenthood. With over 300,000 satisfied customers and a 4.84-star rating, our commitment to quality and efficacy is unmatched.
              </p>
              
              <h3 className="font-heading text-xl font-semibold text-darkText dark:text-white mb-4">
                Targeted Health Solutions
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Whether you're looking for <strong>energy supplements</strong> to power through your day, <strong>sleep support</strong> for better rest, <strong>immune system boosters</strong> for year-round wellness, or <strong>women's health supplements</strong> for hormone balance and fertility, our Food-Grown® range has been specifically formulated to address your unique needs. Each supplement is designed with optimal dosages based on clinical research and contains only the purest, most bioavailable ingredients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section for AEO */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-darkText dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-3">
                  What makes Food-Grown® supplements different from regular vitamins?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Food-Grown® supplements are created through a unique fermentation process that produces nutrients in their most bioactive form. Unlike synthetic vitamins that are chemically manufactured, our supplements contain natural cofactors and enzymes that enhance absorption by 113% compared to synthetic alternatives.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-3">
                  Are your supplements suitable for vegans and vegetarians?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, many of our supplements are certified vegan and suitable for vegetarians. All our Food-Grown® vitamins are produced through plant-based fermentation processes, and we clearly label which products are vegan-certified on each product page.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-3">
                  How long does it take to see results from your supplements?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Results vary by individual and supplement type. Our magnesium supplement typically shows sleep improvements within 1-2 weeks, while fertility support supplements may take 3-6 months for optimal results. Energy and immune support supplements often show benefits within 2-4 weeks of consistent use.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-heading text-lg font-semibold text-darkText dark:text-white mb-3">
                  Do you offer free shipping?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We offer free shipping on orders over $50 within the United States. International shipping rates apply for orders outside the US. All orders are processed within 1-2 business days and typically arrive within 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our most popular supplements, trusted by thousands of health-conscious individuals worldwide.
            </p>
          </div>
          
          {isLoading ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button className="bg-dark-text text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl">
                Why Choose Wild Nutrition?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We're committed to providing the highest quality supplements that support your health journey with science-backed formulations.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md brand-yellow text-dark-text">
                      <Leaf className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-heading text-lg font-semibold text-dark-text">100% Natural Ingredients</h3>
                    <p className="mt-2 text-gray-600">Sourced from the finest organic farms and sustainable suppliers worldwide.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md brand-yellow text-dark-text">
                      <Microscope className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-heading text-lg font-semibold text-dark-text">Science-Backed Formulas</h3>
                    <p className="mt-2 text-gray-600">Every product is formulated based on the latest nutritional research and clinical studies.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md brand-yellow text-dark-text">
                      <Award className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-heading text-lg font-semibold text-dark-text">Third-Party Tested</h3>
                    <p className="mt-2 text-gray-600">All supplements undergo rigorous testing for purity, potency, and safety.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500" 
                alt="Clean eating ingredients" 
                className="w-full rounded-xl shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-dark-text py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Stay Updated
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
              Get the latest health tips, exclusive offers, and product updates delivered to your inbox.
            </p>
          </div>
          
          <div className="mt-8 max-w-md mx-auto">
            <form className="flex" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-md border-0 text-dark-text focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                required
              />
              <Button
                type="submit"
                className="brand-yellow hover:bg-brand-yellow-dark text-dark-text px-6 py-3 rounded-r-md font-medium transition-colors duration-200"
              >
                Subscribe
              </Button>
            </form>
            <p className="mt-3 text-sm text-gray-400 text-center">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
