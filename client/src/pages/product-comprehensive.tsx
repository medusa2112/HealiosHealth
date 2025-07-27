import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus, Check, ArrowRight, CheckCircle } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { PreOrderModal } from "@/components/pre-order-modal";

// Import images
import healiosLogoImg from '@assets/healios-logo (1)_1753466737582.png';
import nutritionistImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';

export default function ProductComprehensive() {
  const [, params] = useRoute("/products/:id");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscriptionMode, setSubscriptionMode] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast({
        title: "Added to cart!",
        description: `${quantity}x ${product.name} has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Product images (using the same image for carousel)
  const productImages = [product.imageUrl, product.imageUrl, product.imageUrl, product.imageUrl];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const subscriptionPrice = subscriptionMode ? (parseFloat(product.price) * 0.8).toFixed(2) : product.price;

  // Product-specific content
  const getProductContent = (productId: string) => {
    switch (productId) {
      case 'apple-cider-vinegar':
        return {
          bundleWith: 'Probiotic + Vitamins Gummies',
          bundlePrice: '£40.00',
          bundleOriginalPrice: '£54.00',
          statisticNumber: '3',
          statisticText: 'pH level of liquid ACV - about the same as battery acid, which can erode tooth enamel',
          testimonial: '"These gummies give me all the benefits of ACV without the harsh taste or stomach burn. Perfect for my daily wellness routine."',
          testimonialAuthor: 'EMMA THOMPSON',
          testimonialTitle: 'Fitness & Wellness Enthusiast',
          benefitTitle: 'Daily metabolic & gut support',
          benefitDescription: '500mg concentrated Apple Cider Vinegar powder supports digestion and energy metabolism in a stomach-friendly, enamel-safe format.',
          ingredientSource: 'Apple Cider Vinegar powder (concentrated)',
          ingredientForm: 'Strawberry-flavored chewable gummies',
          ingredientOrigin: 'Traditional vinegar benefits without acetic acid harshness',
          sleepBenefit: false,
          primaryBenefit: 'Supports digestion, energy metabolism, and appetite management'
        };
      case 'vitamin-d3':
        return {
          bundleWith: 'Magnesium Complex',
          bundlePrice: '£65.00',
          bundleOriginalPrice: '£73.00',
          statisticNumber: '42%',
          statisticText: 'of UK adults are vitamin D deficient, especially during winter months',
          testimonial: '"Vitamin D levels in the UK fall dramatically between October and March. This 1000 IU dose supports optimal serum levels without needing sunlight."',
          testimonialAuthor: 'DR. SARAH WINTERS',
          testimonialTitle: 'Endocrinologist',
          benefitTitle: 'Daily immune and bone support',
          benefitDescription: '1000 IU of vitamin D3 supports immune system function, calcium absorption, muscle function, and maintains healthy bones and teeth.',
          ingredientSource: 'Cholecalciferol (Vitamin D3) 25 μg',
          ingredientForm: 'Lemon-flavored chewable gummies',
          ingredientOrigin: 'Bioidentical to sunlight-produced vitamin D',
          sleepBenefit: false,
          primaryBenefit: 'Supports immune function, bone health, and muscle function'
        };
      case 'ashwagandha':
        return {
          bundleWith: 'Magnesium Gummies',
          bundlePrice: '£42.00',
          bundleOriginalPrice: '£58.00',
          statisticNumber: '3,000',
          statisticText: 'years of traditional use in Ayurvedic medicine for stress support and mental wellbeing',
          testimonial: '"Ashwagandha has been a cornerstone of Ayurvedic wellness for millennia. The 300mg dose in gummy form provides convenient daily support for natural balance and wellbeing."',
          testimonialAuthor: 'DR. ANISHA PATEL',
          testimonialTitle: 'Integrative Wellness & Herbal Medicine Specialist',
          benefitTitle: 'Adaptogenic stress relief & mood support',
          benefitDescription: '300mg Ashwagandha root extract supports mental calm, natural balance, and overall wellbeing through traditional adaptogenic properties.',
          ingredientSource: 'Ashwagandha root extract (Withania somnifera)',
          ingredientForm: 'Strawberry-flavored chewable gummies',
          ingredientOrigin: 'Standardized 5% withanolides extract',
          sleepBenefit: true,
          primaryBenefit: 'Supports natural stress response, mental calm, and overall wellness'
        };
      case 'probiotics':
        return {
          bundleWith: 'Apple Cider Vinegar Gummies',
          bundlePrice: '£58.00',
          bundleOriginalPrice: '£66.00',
          statisticNumber: '70%',
          statisticText: '70% of immune system function is located in the gut',
          testimonial: '"These probiotics have completely transformed my digestive health and overall wellbeing."',
          testimonialAuthor: 'RACHEL THOMPSON',
          testimonialTitle: 'Nutritionist',
          benefitTitle: 'Gut health support',
          benefitDescription: '10 Billion CFU probiotics support digestive health and immune function.',
          ingredientSource: 'Multi-strain probiotic blend',
          ingredientForm: 'Capsules with delayed-release technology',
          ingredientOrigin: 'Laboratory cultured strains',
          sleepBenefit: false,
          primaryBenefit: 'Supports digestive health and immune function'
        };
      case 'magnesium':
        return {
          bundleWith: 'KSM-66 Ashwagandha',
          bundlePrice: '£42.00',
          bundleOriginalPrice: '£58.00',
          statisticNumber: '60%',
          statisticText: 'of Western diets fall short on magnesium - stress, caffeine, and exercise deplete stores faster',
          testimonial: '"Magnesium citrate in gummy form has transformed my recovery routine. I sleep better and my muscles feel less tense after training."',
          testimonialAuthor: 'DR. JAMES THORNTON',
          testimonialTitle: 'Sports Medicine Specialist',
          benefitTitle: 'Muscles, mind & energy support',
          benefitDescription: '90mg bioavailable magnesium citrate reduces fatigue, supports muscle function, and maintains electrolyte balance in a gentle chewable dose.',
          ingredientSource: 'Magnesium citrate (90mg per gummy)',
          ingredientForm: 'Berry-flavored chewable gummies',
          ingredientOrigin: 'Organic citrate form for superior absorption',
          sleepBenefit: true,
          primaryBenefit: 'Reduces tiredness, supports muscle function and electrolyte balance'
        };
      case 'childrens-multivitamin':
        return {
          bundleWith: 'Vitamin D3 Gummies',
          bundlePrice: '£32.00',
          bundleOriginalPrice: '£46.00',
          statisticNumber: '85%',
          statisticText: 'of children don\'t get adequate vitamins from diet alone',
          testimonial: '"These gummies are a game-changer for busy parents. My children actually look forward to taking their vitamins now!"',
          testimonialAuthor: 'DR. SARAH JOHNSON',
          testimonialTitle: 'Pediatric Nutritionist',
          benefitTitle: 'Complete daily nutrition for growing bodies',
          benefitDescription: '13 essential vitamins and minerals support immune function, growth, energy metabolism, and cognitive development in children aged 3-12.',
          ingredientSource: 'Premium vitamin and mineral blend',
          ingredientForm: 'Berry-flavored chewable gummies',
          ingredientOrigin: 'EFSA-approved bioavailable sources',
          sleepBenefit: false,
          primaryBenefit: 'Supports healthy growth, immunity, and cognitive development'
        };
      case 'probiotic-vitamins':
        return {
          bundleWith: 'Apple Cider Vinegar Gummies',
          bundlePrice: '£36.00',
          bundleOriginalPrice: '£49.00',
          statisticNumber: '70%',
          statisticText: 'of your immune cells are housed in your gut',
          testimonial: '"This all-in-one formula has transformed my daily wellness routine. I love getting digestive support and vitamins in one delicious gummy."',
          testimonialAuthor: 'DR. MICHELLE TORRES',
          testimonialTitle: 'Integrative Medicine Specialist',
          benefitTitle: 'Gut, immune, and energy support',
          benefitDescription: 'Multi-functional formula combining 3-strain probiotic blend with essential B & C vitamins for comprehensive daily wellness support.',
          ingredientSource: '3-strain probiotic blend + B & C vitamins',
          ingredientForm: 'Pineapple-flavored gummies',
          ingredientOrigin: 'Shelf-stable probiotic cultures with EFSA-approved vitamins',
          sleepBenefit: false,
          primaryBenefit: 'Supports digestive wellness, immune function, and energy metabolism'
        };
      case 'collagen-complex':
        return {
          bundleWith: 'Vitamin C Gummies',
          bundlePrice: '£39.00',
          bundleOriginalPrice: '£52.00',
          statisticNumber: '25',
          statisticText: 'years - when collagen production begins to naturally decline',
          testimonial: '"Consistent collagen supplementation with vitamin C supports the body\'s natural ability to build and maintain healthy skin structure."',
          testimonialAuthor: 'DR. ELENA RODRIGUEZ',
          testimonialTitle: 'Dermatology Nutritionist',
          benefitTitle: 'Beauty from within support',
          benefitDescription: '500mg hydrolysed collagen peptides with vitamin C for collagen formation, plus biotin and selenium for healthy hair, skin, and nails.',
          ingredientSource: 'Hydrolysed bovine collagen + beauty vitamins',
          ingredientForm: 'Orange-flavored chewable gummies',
          ingredientOrigin: 'Premium collagen peptides with EFSA-approved cofactors',
          sleepBenefit: false,
          primaryBenefit: 'Supports healthy skin, hair, nails, and connective tissues'
        };
      case 'biotin-5000':
        return {
          bundleWith: 'Collagen Complex Gummies',
          bundlePrice: '£42.00',
          bundleOriginalPrice: '£54.00',
          statisticNumber: '10,000%',
          statisticText: 'NRV - delivering therapeutic-level biotin in just one gummy',
          testimonial: '"High-strength biotin supports keratin production for healthy hair and nails. Consistency is key for visible results within 8-12 weeks."',
          testimonialAuthor: 'DR. SOPHIA CHEN',
          testimonialTitle: 'Trichologist & Hair Health Specialist',
          benefitTitle: 'High-potency beauty support',
          benefitDescription: '5000µg pure biotin (vitamin B7) supports healthy hair strength, skin resilience, and nail integrity with just one daily gummy.',
          ingredientSource: 'Pure biotin (vitamin B7) 5000µg',
          ingredientForm: 'Strawberry-flavored chewable gummies',
          ingredientOrigin: 'High-purity biotin with therapeutic potency',
          sleepBenefit: false,
          primaryBenefit: 'Supports hair strength, skin health, and nail integrity'
        };
      case 'iron-vitamin-c':
        return {
          bundleWith: 'Vitamin D3 Gummies',
          bundlePrice: '£32.00',
          bundleOriginalPrice: '£44.00',
          statisticNumber: '50%',
          statisticText: 'better iron absorption when taken with vitamin C compared to iron alone',
          testimonial: '"Iron deficiency is incredibly common, especially in women. This gentle formula with vitamin C enhances absorption while minimizing digestive discomfort."',
          testimonialAuthor: 'DR. REBECCA MARTINEZ',
          testimonialTitle: 'Hematology & Women\'s Health Specialist',
          benefitTitle: 'Energy & focus support',
          benefitDescription: '7mg bioavailable iron with 40mg vitamin C supports healthy red blood cell formation, reduces fatigue, and enhances iron absorption.',
          ingredientSource: 'Iron (ferric pyrophosphate) + Vitamin C',
          ingredientForm: 'Cherry-flavored chewable gummies',
          ingredientOrigin: 'Gentle iron form with absorption enhancer',
          sleepBenefit: false,
          primaryBenefit: 'Supports energy levels, focus, and healthy red blood cell formation'
        };
      case 'folic-acid-400':
        return {
          bundleWith: 'Vitamin D3 Gummies',
          bundlePrice: '£29.00',
          bundleOriginalPrice: '£40.00',
          statisticNumber: '28',
          statisticText: 'days - when neural tube development occurs, often before pregnancy is known',
          testimonial: '"Folic acid supplementation is crucial for all women of reproductive age. Starting 4+ weeks before conception provides optimal maternal folate status for healthy development."',
          testimonialAuthor: 'DR. SARAH WILLIAMS',
          testimonialTitle: 'Consultant Obstetrician & Maternal-Fetal Medicine',
          benefitTitle: 'Pre-pregnancy & prenatal support',
          benefitDescription: '400µg folic acid supports maternal tissue growth during pregnancy and contributes to normal blood formation and psychological function.',
          ingredientSource: 'Folic acid (vitamin B9) 400µg',
          ingredientForm: 'Berry-flavored chewable gummies',
          ingredientOrigin: 'NHS-recommended clinical dose',
          sleepBenefit: false,
          primaryBenefit: 'Supports maternal folate status and tissue growth during pregnancy'
        };
      default:
        return {
          bundleWith: 'Premium Wellness Bundle',
          bundlePrice: '£65.00',
          bundleOriginalPrice: '£73.00',
          statisticNumber: '85%',
          statisticText: 'of people report improved wellness with consistent supplementation',
          testimonial: '"This supplement has become an essential part of my daily wellness routine."',
          testimonialAuthor: 'WELLNESS EXPERT',
          testimonialTitle: 'Health Professional',
          benefitTitle: 'Daily wellness support',
          benefitDescription: 'Carefully formulated to support your daily wellness routine.',
          ingredientSource: 'Premium quality ingredients',
          ingredientForm: 'Optimized delivery format',
          ingredientOrigin: 'Ethically sourced',
          sleepBenefit: false,
          primaryBenefit: 'Supports overall wellness and vitality'
        };
    }
  };

  const productContent = getProductContent(product.id);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${product.name} | Healios`}
        description={product.description}
      />

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 mb-16">
          {/* Image Carousel */}
          <div className="mb-8 lg:mb-0">
            <div className="relative bg-gray-100 aspect-square mb-4">
              {/* Main Image */}
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-black text-white">
                  BEST BUY
                </Badge>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 border-2 ${
                    index === currentImageIndex ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Better Together Section */}
            <div className="bg-gray-50 p-4 mb-6">
              <h3 className="font-medium text-sm mb-2">Better together</h3>
              <p className="text-xs text-gray-600 mb-4">Our Expert Nutritional Therapists Recommend...</p>
              
              <div className="flex items-center gap-3 mb-4">
                <img src={product.imageUrl} alt="Bundle product" className="w-12 h-12 object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.name} + {productContent.bundleWith}</p>
                  <p className="text-xs text-gray-600">{productContent.bundlePrice} {productContent.bundleOriginalPrice}</p>
                </div>
                <Button size="sm" className="bg-black text-white px-4 py-1 text-xs">
                  Add
                </Button>
              </div>

              <p className="text-xs text-gray-600 mb-3">BENEFITS WHEN TAKEN TOGETHER →</p>
              
              {product.inStock ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800"
                  >
                    ADD TO BASKET
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 p-4 text-center">
                    <p className="text-red-800 font-medium text-sm">Currently Sold Out</p>
                    <p className="text-red-600 text-xs mt-1">We're working hard to restock this popular product</p>
                  </div>
                  
                  <Button 
                    onClick={() => setShowPreOrderModal(true)}
                    className="w-full bg-healios-cyan text-white py-3 text-sm font-medium hover:bg-healios-cyan/90"
                  >
                    PRE-ORDER & GET 10% OFF
                  </Button>
                </div>
              )}
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">100% HAPPINESS GUARANTEE</p>
                  <p className="text-gray-600">Not right for you within 30 days? No problem, it's on us.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">FREE UK DELIVERY FOREVER</p>
                  <p className="text-gray-600">UK delivery is always free for subscribers and orders over £40</p>
                </div>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-2">
              {['DESCRIPTION', 'NUTRITIONAL INFORMATION', 'INGREDIENTS', 'HOW TO TAKE', 'FAQS', 'SHIPPING AND RETURNS'].map((section) => (
                <div key={section} className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                    className="w-full py-4 text-left flex items-center justify-between text-sm font-medium"
                  >
                    {section}
                    <Plus className={`w-4 h-4 transition-transform ${expandedSection === section ? 'rotate-45' : ''}`} />
                  </button>
                  {expandedSection === section && (
                    <div className="pb-4 text-sm text-gray-600">
                      {section === 'DESCRIPTION' && (
                        <p>{product.description}</p>
                      )}
                      {section === 'NUTRITIONAL INFORMATION' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (Daily Values for Children):</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="font-medium">Vitamin A: 400μg (50% NRV)</div>
                                <div className="font-medium">Vitamin D2: 5μg (100% NRV)</div>
                                <div className="font-medium">Vitamin E: 6mg (50% NRV)</div>
                                <div className="font-medium">Vitamin C: 40mg (50% NRV)</div>
                                <div className="font-medium">Niacin (B3): 8mg (50% NRV)</div>
                                <div className="font-medium">Pantothenic Acid: 3mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B6: 0.7mg (50% NRV)</div>
                                <div className="font-medium">Folic Acid: 100μg (50% NRV)</div>
                                <div className="font-medium">Vitamin B12: 1.25μg (50% NRV)</div>
                                <div className="font-medium">Biotin: 25μg (50% NRV)</div>
                                <div className="font-medium">Zinc: 5mg (50% NRV)</div>
                                <div className="font-medium">Iodine: 75μg (50% NRV)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value</p>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Vitamin D3 (cholecalciferol): 25 μg (1000 IU) - 500% NRV</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value. 1000 IU is a safe and effective maintenance dose for most healthy adults.</p>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (Vitamins Only - EFSA Approved):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Vitamin B3 (Niacin): 8mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B5 (Pantothenic Acid): 3mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B6: 0.7mg (50% NRV)</div>
                                <div className="font-medium">Vitamin C: 40mg (50% NRV)</div>
                                <div className="font-medium">Probiotic Blend: 3-strain proprietary blend</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value. EFSA health claims apply to vitamin content only. Probiotic efficacy may vary between individuals.</p>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (Take 2 daily for full dose):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Collagen (hydrolysed bovine): 500mg per gummy</div>
                                <div className="font-medium">Vitamin C: 40mg (50% NRV)</div>
                                <div className="font-medium">Vitamin A: 400μg (50% NRV)</div>
                                <div className="font-medium">Vitamin E: 6mg (50% NRV)</div>
                                <div className="font-medium">Biotin: 25μg (50% NRV)</div>
                                <div className="font-medium">Vitamin B6: 0.7mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B12: 1.25μg (50% NRV)</div>
                                <div className="font-medium">Selenium: 27.5μg (50% NRV)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value. EFSA health claims apply to vitamin content only. Collagen benefits require consistent 60+ day use.</p>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (One daily dose):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Biotin (Vitamin B7): 5000μg (10,000% NRV)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value. High doses of biotin may interfere with blood test results. Inform your doctor before lab testing.</p>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Magnesium (citrate): 90mg (24% NRV)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value. Adults can take 1-2 gummies daily. Do not exceed 3 gummies per day.</p>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Iron (ferric pyrophosphate): 7mg (50% NRV)</div>
                                <div className="font-medium">Vitamin C (ascorbic acid): 40mg (50% NRV)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value. Adults and teens 12+: 1-2 gummies daily. Keep out of reach of children.</p>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (NHS-recommended dose):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Folic Acid (Vitamin B9): 400µg (200% NRV)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">*NRV = Nutrient Reference Value. This is the gold-standard dose recommended by NHS and global maternity guidelines.</p>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Ashwagandha Root Extract: 300mg</div>
                                <div className="text-xs text-gray-600">(Withania somnifera, standardized to 5% withanolides)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">Traditional adaptogenic herb. No EFSA health claims authorized for ashwagandha - general wellbeing support only.</p>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Apple Cider Vinegar (powder): 500mg</div>
                                <div className="text-xs text-gray-600">(Concentrated equivalent without harsh acetic acid)</div>
                              </div>
                              <p className="mt-3 text-xs text-gray-600">No EFSA health claims authorized for ACV. Traditional wellness use only. Enamel-safe format vs liquid vinegar.</p>
                            </div>
                          ) : (
                            <div>
                              <p>Per serving nutritional information:</p>
                              <ul className="mt-2 space-y-1">
                                <li>• Active ingredients clearly listed</li>
                                <li>• Third-party tested for purity</li>
                                <li>• No artificial fillers or preservatives</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {section === 'INGREDIENTS' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-2">Berry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Vitamin A (retinyl acetate)</li>
                                <li>• Vitamin D2 (ergocalciferol)</li>
                                <li>• Vitamin E (d-alpha tocopherol)</li>
                                <li>• Vitamin C (ascorbic acid)</li>
                                <li>• B-Complex vitamins (B3, B5, B6, B12, Biotin, Folic Acid)</li>
                                <li>• Zinc (zinc citrate)</li>
                                <li>• Iodine (potassium iodide)</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Gelatin-free, lactose-free, gluten-free formulation suitable for vegetarians.</p>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-2">Lemon-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Cholecalciferol (Vitamin D3) - most bioavailable form</li>
                                <li>• Natural lemon flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Suitable for vegetarians. Cholecalciferol is identical to the form produced by skin exposure to sunlight.</p>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-2">Pineapple-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Bifidobacterium infantis (probiotic strain)</li>
                                <li>• Lactobacillus casei (probiotic strain)</li>
                                <li>• Lactobacillus rhamnosus (probiotic strain)</li>
                                <li>• Vitamin B3 (Niacin)</li>
                                <li>• Vitamin B5 (Pantothenic Acid)</li>
                                <li>• Vitamin B6</li>
                                <li>• Vitamin C (Ascorbic Acid)</li>
                                <li>• Natural pineapple flavoring</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Gelatin-free, vegetarian formulation. Probiotic cultures are shelf-stable in low-water gummy matrix.</p>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-2">Orange-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Hydrolysed bovine collagen peptides (500mg per gummy)</li>
                                <li>• Vitamin C (ascorbic acid) - for collagen formation</li>
                                <li>• Vitamin A (retinyl acetate) - for skin maintenance</li>
                                <li>• Vitamin E (d-alpha tocopherol) - antioxidant protection</li>
                                <li>• Biotin - for hair and skin health</li>
                                <li>• Selenium - cellular antioxidant defence</li>
                                <li>• B-vitamins (B6, B12) - energy metabolism</li>
                                <li>• Natural orange flavoring</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Contains bovine-derived collagen. Not suitable for vegans but suitable for vegetarians. Non-gelatin formulation.</p>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-2">Strawberry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Pure biotin (vitamin B7) - 5000μg therapeutic dose</li>
                                <li>• Natural strawberry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Gelatin-free, suitable for vegetarians and vegans. Free from gluten, dairy, and major allergens.</p>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-2">Berry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Magnesium citrate (90mg per gummy) - highly bioavailable organic form</li>
                                <li>• Natural berry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and low-sugar formulation</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Vegetarian formulation with superior citrate absorption. Gentle on the digestive system.</p>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-2">Cherry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Iron (ferric pyrophosphate) - gentle, low-irritation form vs ferrous sulfate</li>
                                <li>• Vitamin C (ascorbic acid) - enhances iron absorption by up to 50%</li>
                                <li>• Natural cherry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Vegetarian formulation with reduced metallic aftertaste. Gentle on stomach compared to traditional iron tablets.</p>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-2">Berry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Folic acid (vitamin B9) - 400µg clinical dose</li>
                                <li>• Natural berry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                                <li>• Child-safe formulation</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Vegetarian formulation specifically designed for prenatal safety. High compliance gummy format vs traditional tablets.</p>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-2">Strawberry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Ashwagandha root extract (Withania somnifera) - 300mg standardized to 5% withanolides</li>
                                <li>• Natural strawberry flavoring</li>
                                <li>• Pectin (vegan gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                                <li>• Gluten-free, gelatin-free formulation</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Vegan formulation suitable for daily use. Traditional Ayurvedic herb with 3,000+ years of traditional wellness use.</p>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-2">Strawberry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Apple Cider Vinegar powder (concentrated) - 500mg</li>
                                <li>• Natural strawberry flavoring</li>
                                <li>• Pectin (vegan gelling agent)</li>
                                <li>• Natural fruit colors</li>
                                <li>• Natural sweeteners (no artificial sugars)</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-600">Vegan, enamel-safe formulation. Delivers traditional ACV benefits without stomach burn or tooth erosion.</p>
                            </div>
                          ) : (
                            <p>Premium quality ingredients sourced from trusted suppliers worldwide. All ingredients are tested for purity and potency.</p>
                          )}
                        </div>
                      )}
                      {section === 'HOW TO TAKE' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 3-8:</strong> 1 gummy per day</li>
                                <li>• <strong>Ages 9+:</strong> 2 gummies per day</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Take with or without food. Do not exceed recommended dosage. Keep out of reach of children under 3 years.</p>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-2">Daily dosing for adults and teens 12+:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy per day</strong></li>
                                <li>• Can be taken with or without food</li>
                                <li>• Ideal for daily use year-round</li>
                                <li>• Do not exceed recommended dose unless advised by healthcare provider</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 12 unless supervised by a healthcare provider. Consult your GP if taking other vitamin D supplements.</p>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 4-8:</strong> 1 gummy per day</li>
                                <li>• <strong>Ages 9+ and adults:</strong> 2 gummies per day</li>
                                <li>• Best taken in the morning with or without food</li>
                                <li>• Store in cool, dry place to preserve probiotic viability</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 4 years. Consult healthcare provider if taking antibiotics or have compromised immune system.</p>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-2">Adult dosing (18+ years):</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 2 gummies daily</strong> for full 1000mg collagen dose</li>
                                <li>• Can be taken at any time with or without food</li>
                                <li>• Allow minimum 60 days consistent use for visible results</li>
                                <li>• Store below 25°C in dry conditions</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable for pregnant or breastfeeding unless advised by healthcare provider. Contains bovine collagen.</p>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-2">Adult dosing (18+ years):</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy daily</strong> - no more needed</li>
                                <li>• Can be taken with or without food</li>
                                <li>• Recommended minimum 8 weeks for noticeable benefits</li>
                                <li>• Store in cool, dry place below 25°C</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable for children or during pregnancy/lactation without professional advice. Inform healthcare provider before blood tests.</p>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 9-18:</strong> 1 gummy per day</li>
                                <li>• <strong>Adults:</strong> 1-2 gummies per day (do not exceed 3)</li>
                                <li>• Take with water, ideally away from calcium-heavy meals</li>
                                <li>• Evening use may support sleep quality</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Suitable for ages 9+. Start with 1 gummy to assess tolerance. May have laxative effect in high doses.</p>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 12-18:</strong> 1 gummy per day</li>
                                <li>• <strong>Adults:</strong> 1-2 gummies daily depending on iron status</li>
                                <li>• Take with or without food, but avoid calcium-rich meals within 1 hour</li>
                                <li>• Take consistently for 6-12 weeks for maximum benefit</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 12. Keep out of reach of children. Do not exceed recommended dose unless advised by healthcare professional.</p>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-2">Pre-pregnancy & prenatal dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy daily</strong> - standard NHS-recommended dose</li>
                                <li>• Start at least 4+ weeks before trying to conceive</li>
                                <li>• Continue daily throughout first trimester (12 weeks)</li>
                                <li>• Can be taken with or without food</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Women aged 18-40 planning pregnancy. If pregnant, consult doctor before taking new supplements. Do not exceed 1000µg daily unless advised.</p>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-2">Adult dosing (18+ years only):</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy daily</strong> - consistent timing recommended</li>
                                <li>• Best taken in morning or early evening with food</li>
                                <li>• Effects may take 2-4 weeks to manifest</li>
                                <li>• Safe for long-term daily use up to 3 months, then cycle if needed</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable during pregnancy/breastfeeding. Consult doctor if taking thyroid, blood pressure, or psychoactive medications.</p>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-2">Pre-meal dosing for optimal support:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1-2 gummies daily</strong> preferably 15-30 minutes before meals</li>
                                <li>• Do not exceed 3 gummies per day</li>
                                <li>• Best taken with water to aid digestion</li>
                                <li>• Can be taken on empty stomach (unlike liquid ACV)</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 12. May cause mild digestive upset if taken in excess. Start with 1 gummy to assess tolerance.</p>
                            </div>
                          ) : (
                            <p>Take as directed on the packaging. Best taken with food for optimal absorption. Consult your healthcare provider if you have any concerns.</p>
                          )}
                        </div>
                      )}
                      {section === 'FAQS' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about children's vitamins:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Are these safe for picky eaters?</strong> Yes, these gummies are designed specifically for children who struggle with tablets or have selective eating habits.</li>
                                <li>• <strong>Can my child take these with other supplements?</strong> Generally yes, but consult your pediatrician to avoid exceeding daily vitamin limits.</li>
                                <li>• <strong>What age can start taking these?</strong> Suitable for children aged 3 and above. Different dosing for 3-8 vs 9+ age groups.</li>
                                <li>• <strong>Are there any allergens?</strong> These are gelatin-free, lactose-free, gluten-free and suitable for vegetarians.</li>
                              </ul>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Vitamin D3:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why 1000 IU and not higher doses?</strong> 1000 IU is widely accepted as a safe and effective maintenance dose for most healthy adults, providing 2.5x the NHS minimum recommendation.</li>
                                <li>• <strong>When is the best time to take vitamin D?</strong> Any time of day, with or without food. Consistency is more important than timing.</li>
                                <li>• <strong>Is this suitable for winter months?</strong> Yes, especially important during UK winter months (October-March) when sunlight exposure is limited.</li>
                                <li>• <strong>Can I take this if I already take a multivitamin?</strong> Check your multivitamin label to avoid exceeding 4000 IU total daily intake. Consult your healthcare provider if unsure.</li>
                              </ul>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Probiotic + Vitamins:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>How do probiotics survive in gummy form?</strong> Our probiotic strains are protected in a low-water, shelf-stable gummy matrix designed to maintain viability at room temperature.</li>
                                <li>• <strong>Can I take this with antibiotics?</strong> Yes, but space doses 2-3 hours apart from antibiotic medication. Continue taking for several weeks after antibiotic course.</li>
                                <li>• <strong>Will I notice digestive benefits immediately?</strong> Individual responses vary. Some people notice changes within days, while others may take 2-4 weeks of consistent use.</li>
                                <li>• <strong>Is this suitable for travel?</strong> Yes, the shelf-stable format makes it ideal for travel when your normal routine and diet may be disrupted.</li>
                              </ul>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Collagen Complex:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>How long before I see results?</strong> Collagen benefits are cumulative and require consistent use. Allow minimum 60 days for visible changes to skin, hair, and nails.</li>
                                <li>• <strong>Is this suitable for vegans?</strong> No, the collagen is bovine-derived. However, the formulation is non-gelatin and suitable for vegetarians.</li>
                                <li>• <strong>Why is vitamin C included?</strong> Vitamin C is essential for natural collagen formation in the body and enhances the effectiveness of supplemental collagen.</li>
                                <li>• <strong>Can I take this with other beauty supplements?</strong> Yes, but check total vitamin intake to avoid exceeding recommended daily amounts, especially for vitamins A and E.</li>
                              </ul>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Biotin 5000µg:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why such a high dose of biotin?</strong> 5000µg is a therapeutic dose commonly used in beauty supplements for optimal hair and nail support, especially for those with brittle nails or hair concerns.</li>
                                <li>• <strong>Will this interfere with blood tests?</strong> Yes, high-dose biotin can affect lab results including thyroid function and heart markers. Inform your doctor before any blood tests.</li>
                                <li>• <strong>How long before I see improvements?</strong> Hair and nail changes take time. Most people notice benefits after 8-12 weeks of consistent daily use.</li>
                                <li>• <strong>Can I take this with other B vitamins?</strong> Yes, biotin is water-soluble so excess is naturally excreted. However, check total B-vitamin intake to avoid unnecessary excess.</li>
                              </ul>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Magnesium Gummies:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why magnesium citrate over other forms?</strong> Citrate has superior absorption compared to magnesium oxide and is gentler on the digestive system while providing excellent bioavailability.</li>
                                <li>• <strong>Can I take this if I have digestive sensitivities?</strong> Yes, the 90mg dose is gentle and well-tolerated. Start with 1 gummy to assess your individual response.</li>
                                <li>• <strong>When is the best time to take magnesium?</strong> Any time works, but many prefer evening as magnesium may support relaxation and sleep quality.</li>
                                <li>• <strong>Can I take this with calcium supplements?</strong> Space them apart by 2+ hours as calcium can interfere with magnesium absorption when taken simultaneously.</li>
                              </ul>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Iron + Vitamin C:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why is vitamin C included with iron?</strong> Vitamin C significantly enhances iron absorption and helps convert iron into a more bioavailable form, improving uptake by up to 50%.</li>
                                <li>• <strong>Is this suitable for vegetarians and vegans?</strong> Yes, this is ideal for plant-based diets as it provides easily absorbed iron that may be lacking from non-heme plant sources.</li>
                                <li>• <strong>Will this cause stomach upset like iron tablets?</strong> The ferric pyrophosphate form is much gentler than ferrous sulfate, and the gummy format reduces metallic aftertaste and stomach irritation.</li>
                                <li>• <strong>Can I take this if I'm not anemic?</strong> Yes, this is designed for daily maintenance to prevent iron deficiency, especially beneficial for menstruating women and active individuals.</li>
                              </ul>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Folic Acid 400µg:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>When should I start taking folic acid?</strong> Ideally 4+ weeks before trying to conceive, as neural tube development occurs within the first 28 days, often before pregnancy is known.</li>
                                <li>• <strong>Can I take this if I'm not planning pregnancy?</strong> Yes, folic acid supports normal blood formation and psychological function in all women of reproductive age.</li>
                                <li>• <strong>Is 400µg the right dose for everyone?</strong> This is the NHS-recommended standard dose. Women with MTHFR gene variants or previous neural tube defects may need higher doses under medical supervision.</li>
                                <li>• <strong>Can I continue this throughout pregnancy?</strong> Yes for the first trimester, but consult your healthcare provider about comprehensive prenatal vitamins after 12 weeks.</li>
                              </ul>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Ashwagandha Gummies:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>How long before I notice effects?</strong> Most people notice benefits after 2-4 weeks of consistent daily use, especially for stress resilience and sleep quality.</li>
                                <li>• <strong>Can I take this with other supplements?</strong> Generally yes, but avoid taking with sedatives or blood pressure medications without medical supervision.</li>
                                <li>• <strong>Is ashwagandha safe for long-term use?</strong> Studies show safe use up to 3 months continuously. Many people cycle on/off or take breaks every few months.</li>
                                <li>• <strong>Will this make me drowsy?</strong> No, ashwagandha is non-sedative. It supports natural calm and balance without causing drowsiness during the day.</li>
                              </ul>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Apple Cider Vinegar Gummies:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Are these as effective as liquid ACV?</strong> These gummies provide 500mg concentrated ACV powder equivalent to traditional liquid, but in a stomach-friendly format without enamel erosion.</li>
                                <li>• <strong>When is the best time to take them?</strong> 15-30 minutes before meals for optimal digestive support and appetite management.</li>
                                <li>• <strong>Can I take these on an empty stomach?</strong> Yes, unlike harsh liquid ACV, these gummies are gentle enough for empty stomach use.</li>
                                <li>• <strong>Will these help with weight management?</strong> ACV may support appetite control and post-meal satisfaction, but it's not a weight loss product and should be combined with healthy diet and exercise.</li>
                              </ul>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">Common questions about this product:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• Can I take this with other supplements? Generally yes, but consult your healthcare provider.</li>
                                <li>• When will I see results? Individual results vary, typically 2-4 weeks of consistent use.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {section === 'SHIPPING AND RETURNS' && (
                        <div>
                          <p>We currently ship to the following countries:</p>
                          <ul className="mt-2 space-y-1 text-xs">
                            <li>• UK: 2-3 business days</li>
                            <li>• USA: 5-7 business days</li>
                            <li>• Canada: 6-8 business days</li>
                            <li>• Australia: 7 business days</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
            MEET OUR NUTRITIONAL THERAPISTS
          </p>
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
            Through personalised nutrition<br />
            advice, we support the whole you
          </h2>
          <Button className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800">
            <Link href="/consultation">
              Book your free consultation <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Consultation Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <div>
                <img
                  src={nutritionistImg}
                  alt="Book consultation"
                  className="w-full h-48 object-cover mb-4"
                />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  STEP 1
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Book your free consultation
                </h3>
                <p className="text-sm text-gray-600">
                  We know how busy life gets. Choose a day and time to suit you, by Zoom or phone. Remember, this is support on your terms.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <div>
                <img
                  src={nutritionistImg}
                  alt="Bespoke advice"
                  className="w-full h-48 object-cover mb-4"
                />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  STEP 2
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bespoke advice tailored to the whole you
                </h3>
                <p className="text-sm text-gray-600">
                  Our registered nutritional therapists will ask some gentle questions to understand how best to support your body, mind and mood.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <div>
                <img
                  src={nutritionistImg}
                  alt="Health journey"
                  className="w-full h-48 object-cover mb-4"
                />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  STEP 3
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your health journey begins
                </h3>
                <p className="text-sm text-gray-600">
                  You'll receive an email with your personalised health routine. Click to order and your supplements will arrive in next to no time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
            DID YOU KNOW?
          </p>
          <div className="inline-flex items-center justify-center w-24 h-24 border-4 border-white rounded-full mb-6">
            <span className="text-2xl font-light">{productContent.statisticNumber}</span>
          </div>
          <p className="text-lg text-gray-300">
            {productContent.statisticText}
          </p>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-6">
            WHY IT'S IMPORTANT
          </p>
          <blockquote className="text-xl lg:text-2xl font-light text-gray-900 mb-8 italic">
            {productContent.testimonial}
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <img
              src={nutritionistImg}
              alt={productContent.testimonialAuthor}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="font-medium text-sm">{productContent.testimonialAuthor}</p>
              <p className="text-xs text-gray-600">{productContent.testimonialTitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="mb-8 lg:mb-0">
              <img
                src={nutritionistImg}
                alt="Clean ingredients"
                className="w-full h-96 object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                NUTRIENTS OF INTEGRITY
              </p>
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-6">
                Clean ingredients from ethical sources, always
              </h2>
              
              <div className="space-y-6">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  A CLOSER LOOK: {product.name.toUpperCase()}
                </p>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Source</span>
                    <span className="text-gray-900">{productContent.ingredientSource}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Form</span>
                    <span className="text-gray-900">{productContent.ingredientForm}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Country of origin</span>
                    <span className="text-gray-900">{productContent.ingredientOrigin}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Primary benefit</span>
                    <span className="text-gray-900">{productContent.primaryBenefit}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Scientifically studied</span>
                    <span className="text-gray-900">View full reference</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="mb-8 lg:mb-0">
              <img
                src={nutritionistImg}
                alt="Sleep benefits"
                className="w-full h-96 object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                FORMULATIONS WITHOUT COMPROMISE
              </p>
              <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-6">
                Unique supplements: powered by<br />
                <em>nature</em>, backed by <em>science</em>
              </h2>
              
              <div className="space-y-6">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  BENEFITS OF DAILY USE
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{productContent.benefitTitle}</h3>
                      <p className="text-sm text-gray-600">
                        {productContent.benefitDescription}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">The Healios difference</h3>
                      <p className="text-sm text-gray-600">
                        Our supplements are carefully formulated with premium ingredients sourced from trusted suppliers, ensuring optimal quality and bioavailability for your body's needs.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Quality assurance</h3>
                      <p className="text-sm text-gray-600">
                        Every batch is third-party tested for purity and potency, ensuring you receive consistent, reliable nutrition support in every serving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sleep Benefits Section - Only show for products with sleep benefits */}
      {productContent.sleepBenefit && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
              HONESTY OVER HYPE
            </p>
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-8">
              Scientifically supported sleep
            </h2>
            <p className="text-gray-600 mb-12">
              Clinical studies show that Magnesium supplementation can improve sleep quality and duration when taken consistently as part of a healthy routine.
            </p>
            
            <div className="grid grid-cols-2 gap-12 mb-8">
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">42</div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  MINUTES EXTRA SLEEP
                </p>
              </div>
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">32%</div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  INCREASE IN SLEEP QUALITY
                </p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mb-8">
              *Results based on clinical research with magnesium supplementation. Individual results may vary.
            </p>
            
            <img
              src={nutritionistImg}
              alt="Wellness lifestyle"
              className="w-full h-64 object-cover"
            />
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg text-gray-600 mb-8">
            Every 40 seconds one of our supplements is sold
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm font-medium">Excellent</span>
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-600">4.74 based on 306 reviews</span>
          </div>
        </div>
      </section>

      {/* Fixed Bottom Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{product.name}</p>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs text-gray-600">({product.reviewCount} Reviews)</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm">Subscribe & Save 20% - £8.60</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleAddToCart}
              className="bg-black text-white px-6 py-2 text-sm font-medium"
            >
              Add to Basket
            </Button>
          </div>
        </div>
      </div>

      {/* Pre-order Modal */}
      <PreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        productName={product.name}
        productId={product.id}
      />
    </div>
  );
}