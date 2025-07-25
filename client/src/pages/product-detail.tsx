import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Star, ShoppingCart, Heart, Share2 } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const { addToCart } = useCart();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Product Image */}
            <div className="aspect-square lg:aspect-auto">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="p-8">
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h1 className="font-heading text-3xl font-bold text-dark-text mb-2">
                  {product.name}
                </h1>
                {renderStars(product.rating)}
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="font-heading text-3xl font-bold text-dark-text">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice && (
                    <Badge variant="destructive">
                      Save ${(parseFloat(product.originalPrice) - parseFloat(product.price)).toFixed(2)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className={`text-sm font-medium ${
                    product.inStock ? "text-green-600" : "text-red-600"
                  }`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-heading text-lg font-semibold text-dark-text mb-3">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full brand-yellow hover:bg-brand-yellow-dark text-dark-text py-3 text-lg font-medium"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>

                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-5 w-5 mr-2" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Product Features */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-heading text-lg font-semibold text-dark-text mb-4">
                  Key Features
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 100% natural and organic ingredients</li>
                  <li>• Third-party tested for purity and potency</li>
                  <li>• No artificial colors, flavors, or preservatives</li>
                  <li>• Manufactured in FDA-approved facilities</li>
                  <li>• 30-day money-back guarantee</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <div className="border-b">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-brand-yellow py-2 px-1 text-sm font-medium text-dark-text">
                Ingredients
              </button>
              <button className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Nutrition Facts
              </button>
              <button className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Usage Instructions
              </button>
              <button className="border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Reviews
              </button>
            </nav>
          </div>
          
          <div className="mt-6">
            <h4 className="font-heading text-lg font-semibold text-dark-text mb-3">
              Premium Ingredients
            </h4>
            <p className="text-gray-600 mb-4">
              Our {product.name} is carefully formulated with the highest quality ingredients sourced from trusted suppliers worldwide.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h5 className="font-semibold text-dark-text mb-2">Active Ingredients:</h5>
                <ul className="space-y-1">
                  <li>• Premium organic extract</li>
                  <li>• Essential vitamins and minerals</li>
                  <li>• Bioavailable compounds</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-dark-text mb-2">Other Ingredients:</h5>
                <ul className="space-y-1">
                  <li>• Vegetable cellulose (capsule)</li>
                  <li>• Rice flour</li>
                  <li>• Magnesium stearate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
