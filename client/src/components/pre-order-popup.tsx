import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Package, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface PreOrderPopupProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function PreOrderPopup({ product, isOpen, onClose }: PreOrderPopupProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    quantity: 1,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest('/api/pre-orders', 'POST', {
        productId: product.id,
        productName: product.name,
        customerName: formData.firstName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        quantity: formData.quantity,
        notes: formData.notes,
        productPrice: product.price
      });

      setIsSuccess(true);
      toast({
        title: "Pre-order submitted successfully",
        description: "We'll notify you when this product becomes available.",
      });

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          firstName: '',
          email: '',
          phone: '',
          quantity: 1,
          notes: ''
        });
      }, 3000);

    } catch (error) {
      toast({
        title: "Error submitting pre-order",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-black" />
            <h3 className="font-medium text-black">Pre-Order Product</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="font-medium text-black mb-2">Pre-order Submitted!</h4>
            <p className="text-gray-600 text-sm">
              Thank you for your interest in {product.name}. We'll notify you as soon as it's available.
            </p>
          </div>
        ) : (
          <>
            {/* Product Info */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-12 h-12 object-cover bg-gray-100"
                />
                <div>
                  <h4 className="font-medium text-black text-sm">{product.name}</h4>
                  <p className="text-gray-600 text-sm">R{product.price}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-black">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1 focus:ring-black focus:border-black"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-black">
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="mt-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-black">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 focus:ring-black focus:border-black"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-black">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 focus:ring-black focus:border-black"
                  placeholder="+27 123 456 789"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-black">
                  Special Requests
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 focus:ring-black focus:border-black resize-none"
                  placeholder="Any special requests or notes..."
                  rows={2}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Pre-Order'
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                No payment required now. We'll contact you when available.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}