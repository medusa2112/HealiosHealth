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
      { name: 'Apple Cider Vinegar (with the Mother)', amount: '500mg', nrv: '' },
      { name: 'Ginger Extract', amount: '10mg', nrv: '' },
    ]
  } : product?.id === 'ashwagandha' ? {
    nutrient: [
      { name: 'KSM-66® Ashwagandha Root Extract', amount: '500mg', nrv: '' },
      { name: 'Withanolides (5%)', amount: '25mg', nrv: '' },
    ]
  } : product?.id === 'magnesium' ? {
    nutrient: [
      { name: 'Magnesium Glycinate', amount: '400mg', nrv: '107' },
      { name: 'Magnesium Taurate', amount: '100mg', nrv: '27' },
      { name: 'Vitamin B6', amount: '1.4mg', nrv: '100' },
    ]
  } : product?.id === 'magnesium-bisglycinate-b6' ? {
    nutrient: [
      { name: 'Magnesium (total elemental)', amount: '375mg', nrv: '100' },
      { name: 'Magnesium Bisglycinate', amount: '180mg', nrv: '' },
      { name: 'Magnesium Malate', amount: '165mg', nrv: '' },
      { name: 'Magnesium Taurate', amount: '30mg', nrv: '' },
      { name: 'Vitamin B6 (Pyridoxine HCl)', amount: '1.4mg', nrv: '100' },
    ]
  } : product?.id === 'probiotics' ? {
    nutrient: [
      { name: 'Active Live Culture Blend', amount: '10 Billion CFU', nrv: '' },
      { name: 'Fructooligosaccharides (FOS)', amount: '40mg', nrv: '' },
      { name: 'Bifidobacterium lactis', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Bifidobacterium bifidum', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Bifidobacterium longum', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Lactobacillus acidophilus', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Lactobacillus casei rhamnosus', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Streptococcus thermophilus', amount: '1.65 Billion CFU', nrv: '' },
    ]
  } :  [
      { name: 'Vitamin D3 (Cholecalciferol)', amount: '4000 IU (100μg)', nrv: '2000' },
    ]
  } : {
    nutrient: []
  };

  const faqs = product?.id === 'probiotics' ? [
    {
      question: "What makes this probiotic different?",
      answer: "Healios Probiotic Complex uses a broad-spectrum blend of 6 well-studied bacterial strains with 10 billion live CFUs per capsule, plus FOS prebiotics to fuel their growth."
    },
    {
      question: "What is FOS and why is it included?",
      answer: "FOS (fructooligosaccharides) is a natural prebiotic fibre that feeds the friendly bacteria in your gut, helping them survive, thrive, and colonise more effectively."
    },
    {
      question: "Do I need to refrigerate this probiotic?",
      answer: "No — these capsules are shelf-stable and designed for daily use at room temperature."
    },
    {
      question: "When is the best time to take it?",
      answer: "Probiotics are best taken on an empty stomach, such as first thing in the morning or 30–60 minutes before meals. Take 1–2 capsules, once or twice a day with water. Do not take with hot drinks as this may harm live cultures."
    },
    {
      question: "Is this suitable for vegans and people with allergies?",
      answer: "Yes — the formula is 100% vegan, with no dairy, gluten, or soy. The capsule is plant-based and acid-resistant. Manufactured in a facility that handles allergens, but risk of cross-contamination is low and managed under validated controls."
    },
    {
      question: "How long should I take it to see results?",
      answer: "Some people feel benefits in a few days, especially with bloating or bowel regularity. For microbiome support, consistent daily use over 4–8 weeks is ideal."
    }
  ] : product?.id === 'magnesium-bisglycinate-b6' ? [
    {
      question: "What makes this Magnesium Complex different?",
      answer: "It combines three premium, highly bioavailable forms: bisglycinate (gentle on stomach), malate (energy), and taurate (cardiovascular and nervous system). Most supplements use cheaper, less absorbable forms like oxide or citrate."
    },
    {
      question: "Why is Vitamin B6 included?",
      answer: "Vitamin B6 supports the absorption and cellular transport of magnesium, and contributes to energy metabolism, hormonal balance, and nervous system function."
    },
    {
      question: "What benefits can I expect?",
      answer: "Magnesium contributes to reduced fatigue and tiredness, normal muscle function and recovery, improved sleep quality, stress resilience and mood balance, and bone and teeth maintenance."
    },
    {
      question: "Is this safe for sensitive stomachs?",
      answer: "Yes. Magnesium bisglycinate and malate are buffered, gentle forms that are better tolerated than magnesium oxide or citrate, which can cause loose stools in some users."
    },
    {
      question: "When should I take magnesium — morning or night?",
      answer: "It depends on your goal: For energy and muscle recovery — morning. For relaxation or sleep — evening. Split dosing is often best."
    },
    {
      question: "Is it suitable for vegans and people with intolerances?",
      answer: "Yes — it's 100% vegan, gluten-free, dairy-free, and free from artificial preservatives."
    }
  ] : product?.id === 'ashwagandha' ? [
    {
      question: "What makes KSM-66® different from other ashwagandha extracts?",
      answer: "KSM-66® is the most clinically studied ashwagandha extract with over 20 human clinical trials. It's a full-spectrum extract produced using a unique extraction process that preserves the natural balance of active compounds found in the ashwagandha root."
    },
    {
      question: "How does ashwagandha help with stress?",
      answer: "KSM-66® ashwagandha helps reduce cortisol levels (the stress hormone) by up to 27.9% according to clinical studies. This helps restore the body's natural stress response and promotes better overall health, sleep, and mood."
    },
    {
      question: "When should I take ashwagandha?",
      answer: "Take 1 capsule daily with food. Many people prefer taking it in the evening as it can promote relaxation and better sleep quality. For consistent results, take at the same time each day."
    },
    {
      question: "How long before I see results?",
      answer: "Some people notice improvements in stress levels and sleep quality within 2-4 weeks of consistent use. For optimal benefits related to energy and mood, continue for 8-12 weeks as shown in clinical studies."
    },
    {
      question: "Are there any side effects?",
      answer: "KSM-66® ashwagandha is generally well-tolerated. Some people may experience mild drowsiness initially. If you're pregnant, nursing, or taking medications, consult your healthcare provider before use."
    },
    {
      question: "Is this suitable for vegetarians and vegans?",
      answer: "Yes, this product is 100% suitable for both vegetarians and vegans. The capsules are plant-based and contain no animal-derived ingredients."
    }
  ] : product?.id === 'apple-cider-vinegar' ? [
    {
      question: "How is this different from liquid apple cider vinegar?",
      answer: "Our gummies provide 500mg of ACV with the Mother in a convenient, tooth-friendly form without the harsh taste or potential enamel damage from liquid vinegar. Plus, we've added ginger extract for enhanced digestive support."
    },
    {
      question: "What does 'with the Mother' mean?",
      answer: "The Mother is a complex structure of beneficial proteins, enzymes, and friendly bacteria that gives raw, unfiltered ACV its cloudy appearance and health benefits. It's the most important component for gut health support."
    },
    {
      question: "When should I take these gummies?",
      answer: "Take 2 gummies daily, preferably 15-30 minutes before meals to support digestion and metabolism. They can be taken with or without food and won't irritate an empty stomach like liquid ACV can."
    },
    {
      question: "Are these safe for teeth and stomach?",
      answer: "Yes! Unlike liquid ACV which can erode tooth enamel and irritate the stomach, our gummies are pH-balanced and gentle. The natural apple flavor makes them enjoyable to take daily."
    },
    {
      question: "How much sugar do these contain?",
      answer: "Each serving (2 gummies) contains minimal natural sugars from the pectin base. We use natural apple flavoring and avoid artificial sweeteners while keeping sugar content low for daily use."
    },
    {
      question: "Can I take these if I'm diabetic or watching my weight?",
      answer: "Our ACV gummies have a minimal impact on blood sugar. However, if you have diabetes or specific dietary restrictions, consult your healthcare provider before starting any new supplement."
    }
  ] :  "Why do I need vitamin D3 supplementation?",
      answer: "In the UK, limited sunlight exposure from October to March makes it difficult to maintain adequate vitamin D levels naturally. The NHS recommends supplementation for most people during these months to support immune function and bone health."
    },
    {
      question: "What's the difference between D2 and D3?",
      answer: "Vitamin D3 (cholecalciferol) is the same form your skin produces from sunlight and is more effective at raising and maintaining vitamin D blood levels compared to D2 (ergocalciferol)."
    },
    {
      question: "Is 4000 IU safe for daily use?",
      answer: "Yes, 4000 IU is well within safe limits for adults and teens 12+. The tolerable upper limit is 10,000 IU daily. Our dosage provides therapeutic benefits while maintaining a wide safety margin."
    },
    {
      question: "When should I take vitamin D3?",
      answer: "Take with a meal containing some fat for optimal absorption, as vitamin D is fat-soluble. Morning or lunch is ideal, as taking it late in the day may interfere with sleep for some people."
    },
    {
      question: "How long before I see benefits?",
      answer: "Vitamin D levels typically improve within 4-6 weeks of consistent supplementation. Immune and mood benefits may be noticed within 2-4 weeks, while bone health benefits occur over months of consistent use."
    },
    {
      question: "Should I get my vitamin D levels tested?",
      answer: "While not essential, testing can help confirm your starting levels and track improvement. Optimal blood levels are generally considered to be 75-125 nmol/L (30-50 ng/mL)."
    }
  ] : [
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
      answer: "Yes, this product is suitable for both vegetarians and vegans. All ingredients are plant-based and ethically sourced."
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
              {product?.id === 'probiotics' ? (
                <>
                  <strong>Recommended Use:</strong> 1–2 capsules, once or twice a day<br/>
                  <strong>Max Daily Intake:</strong> 4 capsules<br/>
                  <strong>Best taken:</strong> On an empty stomach with water<br/><br/>
                  Do not take with hot drinks (may harm live cultures). Do not exceed the recommended dose.
                </>
              ) : product?.id === 'magnesium-bisglycinate-b6' ? (
                <>
                  <strong>Recommended Use:</strong> 1 capsule, 1–3 times daily<br/>
                  <strong>With or after food</strong><br/><br/>
                  <strong>Tip:</strong> Split across the day (morning and evening) for steady magnesium levels and better sleep support. Do not exceed the recommended dose.
                </>
              ) : product?.id === 'ashwagandha' ? (
                <>
                  <strong>Recommended Use:</strong> 1 capsule daily with food<br/>
                  <strong>Best Time:</strong> Evening for relaxation and sleep support<br/><br/>
                  Take consistently at the same time each day for optimal results. Do not exceed the recommended dose.
                </>
              ) : product?.id === 'apple-cider-vinegar' ? (
                <>
                  <strong>Recommended Use:</strong> Take 2 gummies daily<br/>
                  <strong>Can be taken:</strong> With or without food<br/><br/>
                  For best results, take consistently at the same time each day. Do not exceed the recommended dose.
                </>
              ) : </strong> Take 1 gummy daily<br/>
                  <strong>Can be taken:</strong> With or without food<br/><br/>
                  For optimal absorption, take with a meal containing some fat. Do not exceed the recommended dose.
                </>
              ) : (
                <>
                  Take 1-2 {getProductUnit(product)} daily with food, preferably with your main meal. Take consistently 
                  at the same time each day. Do not exceed the recommended daily dose.
                </>
              )}
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
        {!product.categories?.includes("Children") && (
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
        {product.categories?.includes("Children") && (
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
