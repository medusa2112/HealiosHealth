import { Star } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
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
    <Link href={`/products/${product.id}`}>
      <Card className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">
        <div className="aspect-square w-full bg-gray-200 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-lg font-semibold text-dark-text">
              {product.name}
            </h3>
            {renderStars(product.rating)}
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-heading text-xl font-bold text-dark-text">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              className="brand-yellow hover:bg-brand-yellow-dark text-dark-text px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
