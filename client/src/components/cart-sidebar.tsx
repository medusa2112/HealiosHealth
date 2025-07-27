import { X, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

  return (
    <Sheet open={cart.isOpen} onOpenChange={toggleCart}>
      <SheetContent side="right" className="w-full sm:w-96 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Shopping Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button onClick={toggleCart} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        R{item.product.price} each
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 touch-manipulation"
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium min-w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 touch-manipulation"
                          >
                            +
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            R{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-500 h-8 w-8 p-0 touch-manipulation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cart.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  R{totalPrice.toFixed(2)}
                </span>
              </div>
              <Link href="/checkout">
                <Button 
                  className="w-full bg-black hover:text-[#07a88a] text-white py-3 font-medium transition-colors duration-200 touch-manipulation"
                  onClick={toggleCart}
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
