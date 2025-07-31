import { X, Trash2, Plus, Minus, ShoppingBag, Truck, Shield, Star } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, toggleCart, getTotalPrice } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const totalPrice = getTotalPrice();
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingThreshold = 500;
  const remainingForFreeShipping = Math.max(0, shippingThreshold - totalPrice);

  return (
    <Sheet open={cart.isOpen} onOpenChange={toggleCart}>
      <SheetContent side="right" className="w-full sm:w-[440px] p-0" style={{ height: 'auto', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            <SheetTitle className="text-lg font-semibold text-gray-900 flex-1">
              Your Cart
            </SheetTitle>
            <Badge variant="secondary" className="bg-black text-white flex-shrink-0">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          
          {/* Free Shipping Progress */}
          {cart.items.length > 0 && (
            <div className="mt-3">
              {remainingForFreeShipping > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Free shipping on orders over R{shippingThreshold}</span>
                    <span className="font-medium text-green-600">R{remainingForFreeShipping} to go</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div 
                      className="bg-green-500 h-2 transition-all duration-300"
                      style={{ width: `${Math.min((totalPrice / shippingThreshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <Truck className="w-4 h-4" />
                  <span>Congratulations! You qualify for free shipping</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Content */}
        <div>
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started</p>
              <Button onClick={toggleCart} className="bg-black hover:bg-gray-800 text-white">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="overflow-y-auto max-h-[50vh] px-6 py-4">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover bg-gray-50"
                          />
                          {item.product.featured && (
                            <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1">
                              Bestseller
                            </Badge>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                            {item.product.name}
                          </h4>
                          
                          {/* Product Info */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-600">{item.product.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">({item.product.reviewCount} reviews)</span>
                          </div>

                          {/* Category & Stock Status */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {item.product.category}
                            </Badge>
                            <Badge variant={item.product.inStock ? "default" : "secondary"} className="text-xs">
                              {item.product.inStock ? "In Stock" : "Pre-order"}
                            </Badge>
                          </div>

                          {/* Quantity & Price Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium min-w-8 text-center bg-gray-50 px-2 py-1">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">
                                  R{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  R{item.product.price} each
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="px-6 py-4 bg-gray-50 border-t pb-2">
                {/* Order Summary */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">R{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">
                      {remainingForFreeShipping > 0 ? 'R45.00' : 'FREE'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      R{(totalPrice + (remainingForFreeShipping > 0 ? 45 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>Fast Delivery</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout">
                  <Button 
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 font-medium transition-colors duration-200"
                    onClick={toggleCart}
                  >
                    Secure Checkout - R{(totalPrice + (remainingForFreeShipping > 0 ? 45 : 0)).toFixed(2)}
                  </Button>
                </Link>

                {/* Continue Shopping */}
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 text-gray-600 hover:text-gray-900 mb-0"
                  onClick={toggleCart}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
