import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { SEOHead } from '@/components/seo-head';
import appleCiderVinegarImg from '@assets/Apple-Cider-Vinegar-X_1753469577640.png';
import vitaminD3Img from '@assets/Vitamin-D3-4000iu-X-1_1753469577640.png';
import ashwagandhaImg from '@assets/Ashwagandha-X-2_1753469577639.webp';
import probioticsImg from '@assets/Probiotics10Bil-X_1753469577640.png';
import magnesiumImg from '@assets/Magnesium-X_1753469577641.png';

const productImages: Record<string, string> = {
  'apple-cider-vinegar': appleCiderVinegarImg,
  'vitamin-d3': vitaminD3Img,
  'ashwagandha': ashwagandhaImg,
  'probiotics': probioticsImg,
  'magnesium': magnesiumImg,
};

export default function ProductPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart, toggleCart } = useCart();

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', id],
    queryFn: () => fetch(`/api/products/${id}`).then(res => {
      if (!res.ok) throw new Error('Product not found');
      return res.json();
    }),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toggleCart(); // Open the cart sidebar to show the added item
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">The product you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const productImage = productImages[id as string] || product.imageUrl;

  return (
    <>
      <SEOHead 
        title={`${product.name} | Healios`}
        description={product.description}
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Back Button */}
          <Link href="/products">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-12">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-healios-cyan text-white px-2 py-1 text-xs font-medium">
                    {product.category.toUpperCase()}
                  </span>
                  {product.featured && (
                    <span className="bg-black text-white px-2 py-1 text-xs font-medium">
                      BESTSELLER
                    </span>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-6">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(parseFloat(product.rating))
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                    £{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      £{product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-red-600 text-white px-3 py-1 text-sm font-medium">
                      Save £{(parseFloat(product.originalPrice) - parseFloat(product.price)).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                  {product.description}
                </p>

                {/* Benefits based on product type */}
                <div className="space-y-4 mb-10">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Key Benefits</h3>
                  <div className="space-y-3">
                    {id === 'apple-cider-vinegar' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Supports healthy digestion and gut health</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">May help with weight management</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Contains natural anti-inflammatory compounds</span>
                        </div>
                      </>
                    )}
                    {id === 'vitamin-d3' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Supports immune system function</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Essential for bone and teeth health</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">May help regulate mood and energy</span>
                        </div>
                      </>
                    )}
                    {id === 'ashwagandha' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Helps manage stress and anxiety</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Supports cognitive function and focus</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">May enhance physical performance</span>
                        </div>
                      </>
                    )}
                    {id === 'probiotics' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Supports digestive health and gut microbiome</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">May boost immune system function</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Helps maintain healthy bacterial balance</span>
                        </div>
                      </>
                    )}
                    {id === 'magnesium' && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Promotes better sleep quality</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Supports muscle recovery and relaxation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-healios-cyan flex-shrink-0 mt-2"></div>
                          <span className="text-gray-600 dark:text-gray-400">Helps manage stress and tension</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.inStock ? (
                    <span className="text-green-600 font-medium">✓ In Stock - Ready to Ship</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-6">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="w-full bg-black hover:bg-gray-800 text-white py-4 text-lg font-medium transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - £{product.price}
                  </Button>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">
                      <Heart className="w-4 h-4 mr-2" />
                      Save for Later
                    </Button>
                    <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Our Promise</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>✓ 30-day money-back guarantee</p>
                    <p>✓ Free UK shipping on orders over £25</p>
                    <p>✓ Third-party tested for purity</p>
                    <p>✓ Made with premium, sustainably sourced ingredients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-light text-gray-900 dark:text-white mb-6">How to Use</h3>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                {id === 'apple-cider-vinegar' && (
                  <>
                    <p>Take 2 gummies daily, preferably with meals.</p>
                    <p>Best taken consistently for optimal results.</p>
                    <p>Can be taken with or without food.</p>
                  </>
                )}
                {id === 'vitamin-d3' && (
                  <>
                    <p>Take 1 gummy daily, preferably with a meal containing fat.</p>
                    <p>Best absorbed when taken with food.</p>
                    <p>Consistent daily use recommended for optimal benefits.</p>
                  </>
                )}
                {id === 'ashwagandha' && (
                  <>
                    <p>Take 1-2 capsules daily with water.</p>
                    <p>Can be taken with or without food.</p>
                    <p>Best taken consistently, ideally at the same time each day.</p>
                  </>
                )}
                {id === 'probiotics' && (
                  <>
                    <p>Take 1 capsule daily on an empty stomach.</p>
                    <p>Best taken 30 minutes before meals.</p>
                    <p>Store in a cool, dry place for maximum potency.</p>
                  </>
                )}
                {id === 'magnesium' && (
                  <>
                    <p>Take 1-2 capsules daily, preferably in the evening.</p>
                    <p>Can be taken with or without food.</p>
                    <p>For sleep support, take 30-60 minutes before bedtime.</p>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-light text-gray-900 dark:text-white mb-6">Ingredients</h3>
              <div className="text-gray-600 dark:text-gray-400 space-y-3">
                {id === 'apple-cider-vinegar' && (
                  <>
                    <p><strong>Active Ingredients:</strong> Apple Cider Vinegar (500mg), Ginger Root Extract (50mg)</p>
                    <p><strong>Other Ingredients:</strong> Organic Cane Sugar, Organic Tapioca Syrup, Pectin, Natural Flavors, Citric Acid</p>
                  </>
                )}
                {id === 'vitamin-d3' && (
                  <>
                    <p><strong>Active Ingredients:</strong> Vitamin D3 (Cholecalciferol) 4000 IU</p>
                    <p><strong>Other Ingredients:</strong> Organic Cane Sugar, Organic Tapioca Syrup, Pectin, Natural Orange Flavor, Citric Acid</p>
                  </>
                )}
                {id === 'ashwagandha' && (
                  <>
                    <p><strong>Active Ingredients:</strong> KSM-66 Ashwagandha Root Extract (600mg)</p>
                    <p><strong>Other Ingredients:</strong> Microcrystalline Cellulose, Vegetable Capsule (HPMC), Rice Flour, Magnesium Stearate</p>
                  </>
                )}
                {id === 'probiotics' && (
                  <>
                    <p><strong>Active Ingredients:</strong> Probiotic Blend 10 Billion CFU (Lactobacillus acidophilus, Bifidobacterium lactis, Lactobacillus plantarum)</p>
                    <p><strong>Other Ingredients:</strong> Microcrystalline Cellulose, Vegetable Capsule (HPMC), Inulin, Magnesium Stearate</p>
                  </>
                )}
                {id === 'magnesium' && (
                  <>
                    <p><strong>Active Ingredients:</strong> Magnesium Glycinate (400mg), Magnesium Oxide (100mg)</p>
                    <p><strong>Other Ingredients:</strong> Microcrystalline Cellulose, Vegetable Capsule (HPMC), Rice Flour, Magnesium Stearate</p>
                  </>
                )}
                <p className="text-sm mt-4"><strong>Free from:</strong> Gluten, Dairy, Soy, Artificial Colors, GMOs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}