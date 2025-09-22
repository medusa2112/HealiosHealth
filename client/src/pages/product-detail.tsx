import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus, Check, Bell, Calendar } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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
  const [ params] = useRoute("/products/:id");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscriptionMode, setSubscriptionMode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id});

  // Determine if product is apparel (t-shirt) vs supplement
  const isApparel = product?.categories?.includes('merchandise') || product?.id === 'healios-oversized-tee';

  // Reset subscription state for apparel products
  useEffect(() => {
    if (isApparel) {
      setSubscriptionMode(false);
      setShowNotificationModal(false);
    }
  }, [params?.id, isApparel]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`});
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
    product.imageUrl] : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const nutritionalData = product?.id === 'healios-oversized-tee' ? {
    nutrient: []
  } : product?.id === 'apple-cider-vinegar' ? {
    nutrient: [
      { name: 'Apple Cider Vinegar (with the Mother)', amount: '500mg', nrv: '' },
      { name: 'Ginger Extract', amount: '10mg', nrv: '' }]
  } : product?.id === 'ashwagandha' ? {
    nutrient: [
      { name: 'Per Capsule:', amount: '', nrv: '' },
      { name: 'Ashwagandha Root Extract (KSM-66®)', amount: '500mg', nrv: '' },
      { name: '(equivalent to 6250mg Ashwagandha Root)', amount: '', nrv: '' }]
  } : product?.id === 'magnesium' ? {
    nutrient: [
      { name: 'Magnesium Glycinate', amount: '400mg', nrv: '107' },
      { name: 'Magnesium Taurate', amount: '100mg', nrv: '27' },
      { name: 'Vitamin B6', amount: '1.4mg', nrv: '100' }]
  } : product?.id === 'magnesium-bisglycinate-b6' ? {
    nutrient: [
      { name: 'Per 3-capsule serving:', amount: '', nrv: '' },
      { name: 'Vitamin B6', amount: '1.4 mg', nrv: '100' },
      { name: 'Magnesium', amount: '375 mg', nrv: '100' },
      { name: '• Bisglycinate', amount: '180 mg', nrv: '' },
      { name: '• Malate', amount: '165 mg', nrv: '' },
      { name: '• Taurine Chelate', amount: '30 mg', nrv: '' }]
  } : product?.id === 'probiotics' ? {
    nutrient: [
      { name: 'Active Live Culture Blend', amount: '10 Billion CFU', nrv: '' },
      { name: 'Fructooligosaccharides (FOS)', amount: '40mg', nrv: '' },
      { name: 'Bifidobacterium lactis', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Bifidobacterium bifidum', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Bifidobacterium longum', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Lactobacillus acidophilus', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Lactobacillus casei rhamnosus', amount: '1.67 Billion CFU', nrv: '' },
      { name: 'Streptococcus thermophilus', amount: '1.65 Billion CFU', nrv: '' }]
  } : {
    nutrient: [
      { name: 'Vitamin D3 (cholecalciferol)', amount: '100 µg (4000 IU)', nrv: '2000' },
      { name: 'Energy', amount: '8 kcal (34.07 kJ)', nrv: '' },
      { name: 'Carbohydrates', amount: '2.02 g', nrv: '' },
      { name: '- of which sugars', amount: '1.63 g', nrv: '' },
      { name: 'Protein', amount: '0.01 g', nrv: '' },
      { name: 'Fat', amount: '0.01 g', nrv: '' },
      { name: '- of which saturates', amount: '0 g', nrv: '' },
      { name: 'Fibre', amount: '0.05 g', nrv: '' },
      { name: 'Salt', amount: '0.01 g', nrv: '' }]
  } : {
    nutrient: []
  };

  const faqs = product?.id === 'healios-oversized-tee' ? [] : product?.id === 'probiotics' ? [
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
      question: "What makes this a 'complex'?",
      answer: "It combines three forms of magnesium — bisglycinate, malate, and taurate — chosen for their high absorption and broad benefits, plus vitamin B6 for enhanced utilisation."
    },
    {
      question: "When should I take it?",
      answer: "Magnesium can be taken any time of day, but many prefer it in the evening as it supports relaxation and muscle function."
    },
    {
      question: "Is it suitable for vegans?",
      answer: "Yes. The capsules contain no animal-derived ingredients."
    },
    {
      question: "Can I take it alongside other supplements?",
      answer: "Magnesium and B6 are generally well tolerated, but always check with a healthcare professional if you are on medication or under medical supervision."
    },
    {
      question: "When will I see results?",
      answer: "Results vary between individuals. For best results, take consistently as part of a balanced diet and healthy lifestyle. Not suitable for children, pregnant or breastfeeding women. Always consult a healthcare professional if taking medication or under supervision."
    }
  ] : product?.id === 'ashwagandha' ? [
    {
      question: "How long before I notice effects?",
      answer: "Most people notice benefits such as reduced stress or improved sleep quality after 2–4 weeks of consistent use."
    },
    {
      question: "Can I take this with other supplements?",
      answer: "Yes, Ashwagandha is generally safe with other supplements, but avoid combining with sedatives or blood pressure medication without medical advice."
    },
    {
      question: "Is Ashwagandha safe for long-term use?",
      answer: "Yes — studies support daily use for up to 3 months continuously. Many people follow an 'on/off cycle' by taking breaks after several months."
    },
    {
      question: "Will this make me drowsy?",
      answer: "No — Ashwagandha is non-sedative. It supports calm and balance without causing daytime drowsiness."
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
  ] : [
    {
      question: "Why 4000 IU?",
      answer: "This is a high-strength therapeutic dose (2000% NRV), ideal for maintaining healthy vitamin D levels in adults, especially where sunlight exposure is limited."
    },
    {
      question: "Can children take these gummies?",
      answer: "No, these gummies are formulated for adults only. For children, seek age-appropriate vitamin D supplements."
    },
    {
      question: "When is the best time to take Vitamin D3?",
      answer: "Any time of day, with or without food. Consistency matters more than timing."
    },
    {
      question: "Are these suitable for vegetarians?",
      answer: "Suitable for vegetarians; not suitable for vegans. Vitamin D3 is sourced from lanolin (sheep's wool)."
    },
    {
      question: "Can I take this with a multivitamin?",
      answer: "Yes, but check your multivitamin's vitamin D content to avoid exceeding 4000 IU daily. Consult your healthcare provider if unsure."
    },
    {
      question: "Are they safe for long-term use?",
      answer: "Yes, when taken at the recommended dose. Always consult your healthcare professional if taking other supplements or medications."
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
      answer: false "This product is suitable for vegetarians but not vegans as it contains Vitamin D3 from lanolin (sheep's wool)." : "Yes, this product is suitable for both vegetarians and vegans. All ingredients are plant-based and ethically sourced."
    }
  ];

  const ingredients = product?.id === 'magnesium-bisglycinate-b6' ? [
    'Magnesium Malate, Magnesium Bisglycinate, Capsule Shell (Hydroxypropyl Methylcellulose), Magnesium Taurine Chelate, Microcrystalline Cellulose, Magnesium Stearate, Silicon Dioxide, Pyridoxine HCl (Vitamin B6).'
  ] : [
    'Glucose Syrup',
    'Sugar',
    'Water',
    'Pectin (Gelling Agent)',
    'Citric Acid (Acid)',
    'Sodium Citrate (Acidity Regulator)',
    'Cholecalciferol (Vitamin D3, from lanolin)',
    'Coconut Oil',
    'Carnauba Wax (Anti-sticking Agent)',
    'Natural Orange Flavour',
    'Paprika Extract (Natural Colouring)'
  ] : product?.id === 'ashwagandha' ? [
    'Ashwagandha Root Extract (KSM-66®), Rice Bran, Capsule Shell: Hydroxypropyl Methylcellulose'
  ] : [];

  const howToTake = product?.id === 'magnesium-bisglycinate-b6' ? 
    "Adults: Take 1 capsule, 1–3 times daily with water. Do not exceed the recommended daily amount." 
    : false
    "Adults: Take 1 gummy daily.\n\nChew thoroughly before swallowing (do not swallow whole).\n\nDo not exceed the recommended daily dose.\n\nBest taken consistently year-round, especially in winter months.\n\nNot recommended for children.\nThese are adult-strength gummies (4000 IU). The label only provides adult directions: 1 gummy daily"
    : product?.id === 'ashwagandha' ?
    "Adults (18+): Take 1 capsule daily, with water.\n\nBest taken in the morning or early evening, ideally with food\n\nConsistency is important — allow 2–4 weeks for effects to build\n\nSafe for long-term daily use up to 3 months, then take a break if needed\n\nNot suitable during pregnancy or breastfeeding\n\nConsult a doctor before use if taking thyroid medication, blood pressure medication, or psychoactive drugs\n\n❌ Not suitable for children.\nIntended for adults (18+). Not recommended during pregnancy or breastfeeding."
    : "";

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
                {!isApparel && product.type === 'supplement' && product.bottleCount && (
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

                {/* Reorder Notification Modal - Only for supplements */}
                {!isApparel && showNotificationModal && (
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

                {/* Subscription Toggle - Only for supplements */}
                {!isApparel && (
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
                )}

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

        {/* How to take - Only show for supplements */}
        {product?.id !== 'healios-oversized-tee' && (
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
                ) : (
                  <>
                    <strong>Recommended Use:</strong> Take 1 gummy daily<br/>
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
        )}

        {/* Ingredients Section */}
        {ingredients.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How to Take Section */}
        {howToTake && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">How to Take</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {howToTake}
            </p>
          </div>
        )}

        {/* Health Claims Section - Only for ashwagandha */}
        {product?.id === 'ashwagandha' && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">The Clinically Proven Adaptogen</h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                KSM-66® is a premium full-spectrum Ashwagandha root extract, developed over 14 years of research and backed by 50+ clinical studies. Each capsule delivers 500mg daily, shown in studies to support stress resilience, balanced cortisol levels, cognitive performance, and overall wellbeing.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">At a Glance</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>500mg KSM-66® Ashwagandha per Capsule</strong> – full-spectrum root extract
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>50+ Clinical Studies</strong> – researched for stress, cognition, sleep, and energy
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>14 Years of Development</strong> – validated through rigorous testing
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Shown to Reduce Cortisol by ~27%</strong> – helping the body adapt to stress
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information Section - For ashwagandha */}
        {(product?.id === 'ashwagandha') && (
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Other Key Information</h2>
            <div className="space-y-4">
              {product?.id === 'ashwagandha' ? (
                <>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Third-Party Tested</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">for purity, potency, and heavy metals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Vegan-Friendly</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">no animal-derived ingredients</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Traditional Use</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Ashwagandha has over 3,000 years of use in Ayurvedic practice</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Third-Party Tested</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">for purity, potency, and heavy metals.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">No Artificial Nasties</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">free from artificial colours, flavours, and preservatives.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Sustainable Sourcing</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">responsibly sourced ingredients.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Storage</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Store in a cool, dry, dark place below 25°C. Keep out of reach of children.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Safety & Disclaimers Section */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Safety & Disclaimers</h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  <span className="font-medium">Important:</span> This product is not intended to diagnose, treat, cure, or prevent any disease. 
                  Food supplements should not be used as a substitute for a varied, balanced diet and healthy lifestyle.
                </p>
                <p>
                  <span className="font-medium">Keep out of reach of children.</span>
                </p>
                <p>
                  <span className="font-medium">Consult a healthcare professional</span> if pregnant, breastfeeding, or taking medication.
                </p>
                <p>
                  <span className="font-medium">Do not exceed a total of 100 µg/day vitamin D without medical advice.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FAQs Section - Only show if there are FAQs */}
        {faqs.length > 0 && (
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
        )}

        {/* Better Together Section - Only for non-Children supplements */}
        {!isApparel && !product.categories?.includes("Children") && (
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
