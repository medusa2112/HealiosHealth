import { X, Trash2 } from "lucide-react";
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
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle className="font-heading text-lg font-semibold text-dark-text">
            Shopping Cart
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
                  <div key={item.product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-dark-text text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ${item.product.price} × {item.quantity}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          -
                        </Button>
                        <span className="text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cart.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading font-semibold text-dark-text">Total:</span>
                <span className="font-heading font-bold text-xl text-dark-text">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <Button className="w-full brand-yellow hover:bg-brand-yellow-dark text-dark-text py-3 rounded-md font-medium transition-colors duration-200">
                Checkout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
