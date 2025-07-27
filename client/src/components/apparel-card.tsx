import { useState } from 'react';
import { Link } from 'wouter';
import { PreOrderModal } from './pre-order-modal';

interface ApparelProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  category: string;
  rating: string;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  sizes: string[] | null;
  colors: string[] | null;
  gender: 'Men' | 'Women' | null;
  type: 'apparel';
}

interface ApparelCardProps {
  product: ApparelProduct;
  badge?: string;
}

export function ApparelCard({ product, badge }: ApparelCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || 'Black');
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Since all products are pre-order, show modal instead
    setShowPreOrderModal(true);
  };

  const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL'];
  const colors = product.colors || ['Black'];

  return (
    <>
      <Link href={`/products/${product.id}`}>
        <div className="group cursor-pointer" itemScope itemType="https://schema.org/Product">
          {/* Product Image Container */}
          <div className="relative bg-gray-50 dark:bg-gray-800 mb-6 aspect-square overflow-hidden group-hover:shadow-lg transition-all duration-300">
            {/* Product Badge */}
            {badge && (
              <div className="absolute top-3 left-3 bg-white dark:bg-gray-700 text-black dark:text-white px-2 py-1 text-xs font-medium z-10 shadow-sm">
                {badge}
              </div>
            )}
            
            {/* Product Image */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              itemProp="image"
            />
            
            {/* Pre-Order Button */}
            <button 
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 bg-black text-white px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
            >
              Pre-Order
            </button>
          </div>
          
          {/* Product Info */}
          <div className="space-y-3">
            <h3 className="font-normal text-gray-900 dark:text-white text-sm group-hover:text-healios-cyan transition-colors" itemProp="name">
              {product.name}
            </h3>
            
            {/* Price */}
            <div className="text-sm text-gray-800 dark:text-gray-200 font-medium" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span className="line-through text-gray-400 mr-2 text-xs">£{product.originalPrice}</span>
              <span itemProp="price" content={product.price}>£{product.price}</span>
              <meta itemProp="priceCurrency" content="GBP" />
              <meta itemProp="availability" content="https://schema.org/PreOrder" />
            </div>
            
            {/* Size Selection */}
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Size:</div>
              <div className="flex gap-1">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={`px-2 py-1 text-xs border transition-colors ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Color:</div>
              <div className="flex gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    className={`px-2 py-1 text-xs border transition-colors ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Pre-order Notice */}
            <div className="text-xs text-healios-cyan font-medium">
              Pre-order • Ships in 2-3 weeks
            </div>
          </div>
        </div>
      </Link>

      {/* Pre-Order Modal */}
      <PreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        productName={product.name}
        productPrice={product.price}
      />
    </>
  );
}