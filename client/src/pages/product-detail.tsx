import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus, Check, Bell, Calendar } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";

// Helper function to determine the correct unit for products
const getProductUnit = (product: Product): string => {
  const name = product.name.toLowerCase();
  if (name.includes('gummies')) return 'gummies';
  if (name.includes('powder')) return 'servings';
  if (name.includes('capsules')) return 'capsules';
  if (name.includes('tablets')) return 'tablets';
  // Default for supplements
  return 'capsules';
};

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscriptionMode, setSubscriptionMode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < fullStars || (i === fullStars && hasHalfStar)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating} ({product?.reviewCount} reviews)
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Product images (using same image multiple times as placeholder)
  const productImages = product ? [
    product.imageUrl,
    product.imageUrl,
    product.imageUrl,
    product.imageUrl,
  ] : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const nutritionalData = product?.id === 'apple-cider-vinegar' ? {
    nutrient: [
      { name: 'Apple Cider Vinegar', amount: '500mg', nrv: '' },
      { name: 'Chromium', amount: '40μg', nrv: '100' },
      { name: 'Vitamin B6', amount: '1.4mg', nrv: '100' },
    ]
  } : product?.id === 'ashwagandha' ? {
    nutrient: [
      { name: 'KSM-66® Ashwagandha Extract', amount: '600mg', nrv: '' },
      { name: 'Withanolides', amount: '30mg', nrv: '' },
      { name: 'Magnesium', amount: '56mg', nrv: '15' },
    ]
  } : product?.id === 'magnesium' ? {
    nutrient: [
      { name: 'Magnesium Glycinate', amount: '400mg', nrv: '107' },
      { name: 'Magnesium Taurate', amount: '100mg', nrv: '27' },
      { name: 'Vitamin B6', amount: '1.4mg', nrv: '100' },
    ]
  } : product?.id === 'probiotics' ? {
    nutrient: [
      { name: 'Live Bacterial Cultures', amount: '10 Billion CFU', nrv: '' },
      { name: 'Lactobacillus acidophilus', amount: '3 Billion CFU', nrv: '' },
      { name: 'Bifidobacterium longum', amount: '2 Billion CFU', nrv: '' },
    ]
  } : product?.id === 'vitamin-d3' ? {
    nutrient: [
      { name: 'Vitamin D3 (Cholecalciferol)', amount: '4000 IU', nrv: '2000' },
      { name: 'Vitamin K2 (MK-7)', amount: '100μg', nrv: '133' },
      { name: 'Coconut Oil (MCT)', amount: '500mg', nrv: '' },
    ]
  } : {
    nutrient: []
  };

  const faqs = [
    {
      question: "How should I take this supplement?",
      answer: "Take 1-2 capsules daily with food, preferably with your main meal. For optimal absorption, take consistently at the same time each day."
    },
    {
      question: "Are there any side effects?",
      answer: "This supplement is generally well-tolerated. Some people may experience mild digestive discomfort when first starting. If you experience any adverse effects, discontinue use and consult your healthcare provider."
    },
    {
      question: "Can I take this with other supplements?",
      answer: "Yes, this supplement can generally be taken with other vitamins and minerals. However, if you're taking medication or have health conditions, consult your healthcare provider before combining supplements."
    },
    {
      question: "How long should I take this supplement?",
      answer: "This supplement is designed for daily use as part of your wellness routine. The duration of use depends on your individual needs and goals. Consult with a healthcare professional for personalized advice."
    },
    {
      question: "Is this suitable for vegetarians/vegans?",
      answer: product?.id === 'vitamin-d3' ? "This product is suitable for vegetarians but not vegans as it contains Vitamin D3 from lanolin (sheep's wool)." : "Yes, this product is suitable for both vegetarians and vegans. All ingredients are plant-based and ethically sourced."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-gray-50 dark:bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Products</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5 pb-12">
        {/* Main Product Section */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 mb-16">
          {/* Image Carousel */}
          <div className="mb-8 lg:mb-0">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden mb-4">
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-3 justify-center">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 border-2 overflow-hidden ${
                        index === currentImageIndex ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
              
              {/* Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  4.8 ({product.reviewCount} Reviews)
                </span>
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                  Scroll to reviews
                </button>
              </div>

              {/* Benefits List */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Premium quality ingredients</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Third-party tested for purity</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Carefully formulated</span>
                </li>
              </ul>
            </div>

            {/* Pricing Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="mb-6">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-3xl font-light text-gray-900 dark:text-white">
                    R{product.price}
                  </span>
                </div>

                {/* Supply Information Badge - Only for supplements */}
                {product.type === 'supplement' && product.bottleCount && (
                  <div className="bg-white border border-black text-black px-3 py-2 text-xs mb-4 inline-flex items-center gap-4">
                    <span>{product.bottleCount} {getProductUnit(product)}</span>
                    <span>•</span>
                    <span>{product.dailyDosage} per day</span>
                    <span>•</span>
                    <span>{product.supplyDays}-day supply</span>
                    <button 
                      onClick={() => setShowNotificationModal(true)}
                      className="ml-2 bg-white border border-black text-black px-2 py-1 hover:bg-gray-50 transition-colors text-xs"
                      title="Set reorder reminder"
                    >
                      Get Notified
                    </button>
                  </div>
                )}

                {/* Reorder Notification Modal */}
                {showNotificationModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 p-6 max-w-sm w-full">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Reorder Reminder</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Get notified 10 days before your {product.supplyDays && product.type === 'supplement' ? `${product.supplyDays}-day ` : ''}supply runs out.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setShowNotificationModal(false);
                            toast({
                              title: "Reminder set!",
                              description: product.type === 'supplement' && product.supplyDays ? `We'll notify you on ${new Date(Date.now() + (product.supplyDays - 10) * 24 * 60 * 60 * 1000).toLocaleDateString()}` : 'We\'ll notify you when it\'s time to reorder'
                            });
                          }}
                          className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                        >
                          Set Reminder
                        </button>
                        <button 
                          onClick={() => setShowNotificationModal(false)}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Toggle */}
                <div className="space-y-4 mb-6">
                  <div className={`border-2 p-4 cursor-pointer transition-colors ${
                    !subscriptionMode ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`} onClick={() => setSubscriptionMode(false)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">One-time purchase</div>
                        <div className="text-sm text-gray-600">R{product.price}</div>
                      </div>
                      <div className={`w-4 h-4 border-2 ${
                        !subscriptionMode ? 'border-black bg-black' : 'border-gray-300'
                      }`}></div>
                    </div>
                  </div>

                  <div className={`border-2 p-4 cursor-pointer transition-colors ${
                    subscriptionMode ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`} onClick={() => setSubscriptionMode(true)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Subscribe & save 20%</div>
                        <div className="text-sm text-gray-600">R{(parseFloat(product.price) * 0.8).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-1">Delivery every 30 days</div>
                      </div>
                      <div className={`w-4 h-4 border-2 ${
                        subscriptionMode ? 'border-black bg-black' : 'border-gray-300'
                      }`}></div>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-medium">Quantity</label>
                  <div className="flex items-center border border-gray-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-4 text-sm font-medium hover:bg-gray-800 transition-colors mb-4"
                >
                  {subscriptionMode ? 'Subscribe' : 'Add to Basket'}
                </button>

                {/* Guarantee & Delivery Info */}
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>100% Happiness guarantee</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Free UK delivery, forever</span>
                  </div>
                  {subscriptionMode && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">How subscriptions work</h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Free UK Delivery every 30 days</li>
                        <li>• Change or cancel anytime</li>
                        <li>• Refillable glass jar & recyclable refills</li>
                        <li>• Priority customer support</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-16">
          <div className="bg-gray-50 dark:bg-gray-800 p-8">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Description</h2>
            <div 
              className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.description
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
                  .replace(/•\s(.*?)$/gm, '<li class="ml-4">$1</li>')
                  .replace(/✔\s(.*?)(?=\s✔|$)/g, '<span class="inline-flex items-center gap-2 mr-4 mb-2"><svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>$1</span>')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^/, '<p class="mb-4">')
                  .replace(/$/, '</p>')
                  .replace(/<p class="mb-4"><li/g, '<ul class="list-none mb-4"><li')
                  .replace(/<\/li><\/p>/g, '</li></ul>')
              }}
            />
          </div>
        </div>

        {/* Nutritional Information */}
        {nutritionalData.nutrient.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Nutritional information</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-sm font-medium text-gray-900 dark:text-white">Nutrient</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-900 dark:text-white">Per serving</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-900 dark:text-white">% NRV*</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionalData.nutrient.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{item.name}</td>
                      <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{item.amount}</td>
                      <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{item.nrv || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                *NRV = Nutrient Reference Value
              </p>
            </div>
          </div>
        )}

        {/* How to take */}
        <div className="mb-16">
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">How to take</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Take 1-2 capsules daily with food, preferably with your main meal. Take consistently 
              at the same time each day. Do not exceed the recommended daily dose.
            </p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white">Have questions? We have answers</h2>
            <div className="flex gap-4">
              <Link href="/contact">
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                  Ask a question
                </button>
              </Link>
              <Link href="/contact">
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline">
                  Contact support
                </button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  <Plus className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-45' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Better Together Section - Only for non-Children products */}
        {product.category !== "Children" && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">
              Better <em className="italic">together</em>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Our Expert Nutritional Therapists Recommend...
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                <div className="mb-6 lg:mb-0">
                  <img
                    src="/assets/healios-health27.png"
                    alt="Supplement bundle recommendation"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                    {product.name} + Magnesium Complex
                  </h3>
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-2xl font-light text-gray-900 dark:text-white">
                      R{(parseFloat(product.price) + 14.99).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      R{(parseFloat(product.price) + 24.99).toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Save R10.00
                    </Badge>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Quality ingredients</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Convenient daily supplement</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Third-party tested</span>
                    </li>
                  </ul>
                  <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                    + Add Bundle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Discount Section - Only for Children products */}
        {product.category === "Children" && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">
              Stock Up & <em className="italic">Save</em>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Buy 2 or more and save 20% on your order
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 p-8">
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Multi-Buy Discount
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Perfect for keeping your little ones healthy all year round
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 mb-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-left">
                      <p className="text-sm text-gray-600 dark:text-gray-400">2 Bottles</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Regular Price: R{(parseFloat(product.price) * 2).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600 dark:text-green-400">20% Off</p>
                      <p className="text-lg font-medium text-green-600 dark:text-green-400">
                        Your Price: R{(parseFloat(product.price) * 2 * 0.8).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Save R{(parseFloat(product.price) * 2 * 0.2).toFixed(2)}
                  </Badge>
                </div>

                <ul className="space-y-2 mb-6 text-left max-w-md mx-auto">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{product.supplyDays && product.supplyDays >= 60 ? `${Math.floor(product.supplyDays / 30)}+ month` : `${product.supplyDays || 30}+ day`} supply for your child</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Never run out of essential vitamins</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Automatic 20% discount at checkout</span>
                  </li>
                </ul>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Discount automatically applied when you add 2 or more bottles to your cart
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
