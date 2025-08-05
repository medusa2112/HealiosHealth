import { Star } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { PreOrderPopup } from "@/components/pre-order-popup";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
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
            className={`h-4 w-4 ${
              i < fullStars || (i === fullStars && hasHalfStar)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-500">({product.reviewCount})</span>
      </div>
    );
  };

  return (
    <>
    <Link href={`/products/${product.id}`}>
      <div className={`group cursor-pointer ${!product.inStock ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : ''} transition-all duration-300`}>
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 mb-4 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${!product.inStock ? 'group-hover:filter-none' : ''}`}
          />
          
          {/* Supply Badge - Top Right - Only for supplements */}
          {product.type === 'supplement' && product.supplyDays && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-black text-white px-3 py-1 text-xs font-medium rounded-full">
                {product.supplyDays >= 60 ? `${Math.round(product.supplyDays / 30)}-month` : `${product.supplyDays}-day`} supply
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.featured && (
              <span className="bg-black text-white px-2 py-1 text-xs font-medium">
                BESTSELLER
              </span>
            )}

            {!product.inStock && (
              <span className={`text-white px-2 py-1 text-xs font-medium ${
                product.id === 'childrens-multivitamin' 
                  ? 'bg-red-600' 
                  : 'bg-red-600'
              }`}>
                {product.id === 'childrens-multivitamin' ? 'PREORDER CAP REACHED' : 'SOLD OUT'}
              </span>
            )}
          </div>

          {/* Add to Cart/Pre-order Button - appears on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            {product.inStock ? (
              <Button
                onClick={handleAddToCart}
                className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 text-sm font-medium hover:bg-white hover:text-black transition-all duration-300 border border-black/20 shadow-lg"
                style={{ borderRadius: '0' }}
              >
                Add to Cart
              </Button>
            ) : product.id === 'childrens-multivitamin' ? (
              <div className="bg-red-600/80 backdrop-blur-sm text-white px-6 py-3 text-sm font-medium border border-red-600/20 shadow-lg">
                Cap Reached
              </div>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPreOrderModal(true);
                }}
                className="bg-red-600/80 backdrop-blur-sm text-white px-6 py-3 text-sm font-medium hover:bg-white hover:text-red-600 transition-all duration-300 border border-red-600/20 shadow-lg"
                style={{ borderRadius: '0' }}
              >
                Pre-Order Now
              </Button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className={`text-lg font-medium group-hover:transition-colors ${!product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(parseFloat(product.rating || "5"))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold ${!product.inStock ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              R{product.price}
            </span>
          </div>
        </div>
      </div>
    </Link>
    
    {/* Pre-order Modal */}
    <PreOrderPopup
      product={product}
      isOpen={showPreOrderModal}
      onClose={() => setShowPreOrderModal(false)}
    />
    </>
  );
}
