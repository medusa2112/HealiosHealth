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

// Import images
import healiosNatureImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';
import nutritionistImg from '@assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg';
import fitnessImg from '@assets/fitness-running-and-woman-in-a-city-at-night-for-2023-11-27-05-00-25-utc(1)_1753466794043.mov';

export default function ProductComprehensive() {
  const [, params] = useRoute("/products/:id");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscriptionMode, setSubscriptionMode] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
          bundleWith: 'KSM-66 Ashwagandha Plus',
          bundlePrice: '£68.00',
          bundleOriginalPrice: '£76.00',
          statisticNumber: '75%',
          statisticText: 'Today\'s apples contain 75% less nutrients than in 1940',
          testimonial: '"Apple Cider Vinegar has transformed my digestive health. I feel more balanced and energetic every day."',
          testimonialAuthor: 'SARAH MITCHELL',
          testimonialTitle: 'Wellness Coach',
          benefitTitle: 'Digestive wellness support',
          benefitDescription: 'Apple Cider Vinegar with Ginger supports healthy digestion and may help with nutrient absorption.',
          ingredientSource: 'Organic Apple Cider Vinegar',
          ingredientForm: 'Gummies with natural apple flavor',
          ingredientOrigin: 'Organic orchards, USA',
          sleepBenefit: false,
          primaryBenefit: 'Supports healthy digestion and gut wellness'
        };
      case 'vitamin-d3':
        return {
          bundleWith: 'Magnesium Complex',
          bundlePrice: '£65.00',
          bundleOriginalPrice: '£73.00',
          statisticNumber: '85%',
          statisticText: '85% of UK adults have insufficient Vitamin D levels',
          testimonial: '"Since taking Vitamin D3, I feel more energetic and my mood has improved significantly."',
          testimonialAuthor: 'JAMES WALKER',
          testimonialTitle: 'Fitness Instructor',
          benefitTitle: 'Immune system support',
          benefitDescription: 'Vitamin D3 supports immune function and is essential for bone health.',
          ingredientSource: 'Cholecalciferol (Vitamin D3)',
          ingredientForm: 'Gummies with natural orange flavor',
          ingredientOrigin: 'Sustainably sourced',
          sleepBenefit: false,
          primaryBenefit: 'Supports immune system and bone health'
        };
      case 'ashwagandha':
        return {
          bundleWith: 'Magnesium Complex',
          bundlePrice: '£72.00',
          bundleOriginalPrice: '£80.00',
          statisticNumber: '32%',
          statisticText: '32% reduction in stress levels in clinical studies',
          testimonial: '"Ashwagandha has been a game-changer for managing my daily stress and improving my focus."',
          testimonialAuthor: 'EMILY CARTER',
          testimonialTitle: 'Business Executive',
          benefitTitle: 'Stress management support',
          benefitDescription: 'KSM-66 Ashwagandha is clinically studied to help manage stress and support cognitive function.',
          ingredientSource: 'KSM-66 Ashwagandha Root Extract',
          ingredientForm: 'Capsules with standardized withanolides',
          ingredientOrigin: 'Organic farms, India',
          sleepBenefit: false,
          primaryBenefit: 'Helps manage stress and supports cognitive function'
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
          bundlePrice: '£68.00',
          bundleOriginalPrice: '£76.00',
          statisticNumber: '75%',
          statisticText: 'Today\'s carrots contain 75% less magnesium than in 1940',
          testimonial: '"Magnesium is a game-changer for so many. I have chosen to use our Magnesium because I have never found a more effective source."',
          testimonialAuthor: 'HENRIETTA NORTON',
          testimonialTitle: 'Founder & Nutritionist',
          benefitTitle: 'Sleep and relaxation support',
          benefitDescription: 'Magnesium supports muscle relaxation and may help improve sleep quality.',
          ingredientSource: 'Magnesium Glycinate & Magnesium Taurate',
          ingredientForm: 'Capsules with high bioavailability',
          ingredientOrigin: 'Premium chelated forms',
          sleepBenefit: true,
          primaryBenefit: 'Supports muscle relaxation and sleep quality'
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
                          <p>Per serving nutritional information:</p>
                          <ul className="mt-2 space-y-1">
                            <li>• Active ingredients clearly listed</li>
                            <li>• Third-party tested for purity</li>
                            <li>• No artificial fillers or preservatives</li>
                          </ul>
                        </div>
                      )}
                      {section === 'INGREDIENTS' && (
                        <p>Premium quality ingredients sourced from trusted suppliers worldwide. All ingredients are tested for purity and potency.</p>
                      )}
                      {section === 'HOW TO TAKE' && (
                        <p>Take as directed on the packaging. Best taken with food for optimal absorption. Consult your healthcare provider if you have any concerns.</p>
                      )}
                      {section === 'FAQS' && (
                        <div>
                          <p className="font-medium">Common questions about this product:</p>
                          <ul className="mt-2 space-y-2">
                            <li>• Can I take this with other supplements? Generally yes, but consult your healthcare provider.</li>
                            <li>• When will I see results? Individual results vary, typically 2-4 weeks of consistent use.</li>
                          </ul>
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
                  src={healiosNatureImg}
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
                  src={healiosNatureImg}
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
                src={healiosNatureImg}
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
                src={healiosNatureImg}
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
              src={healiosNatureImg}
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
    </div>
  );
}