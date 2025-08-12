import { useState } from "react";
import { X, Mail, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
}

export function PreOrderModal({ isOpen, onClose, productName, productId }: PreOrderModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/pre-orders", {
        customerEmail: email,
        customerName: name,
        productId,
        productName,
        productPrice: "Various", // For multi-product pre-orders
        quantity: 1,
      });
      
      setIsSuccess(true);
      toast({
        title: "Pre-order confirmed!",
        description: "You'll receive 10% off when this product launches",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit pre-order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setName("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm" onClick={handleClose} role="dialog" aria-labelledby="preorder-modal-title" aria-describedby="preorder-modal-description">
      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-gray-900 p-6 sm:p-8 max-w-sm sm:max-w-md w-full max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors shadow-lg z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Percent className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 id="preorder-modal-title" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Get 10% Off When Available
              </h2>
              <p id="preorder-modal-description" className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed px-2">
                <strong>{productName}</strong> will be restocking soon. Secure your spot in line and save 10% on your order when new stock arrives on August 28th.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </Label>
                <div className="mt-1">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="h-10 sm:h-11 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="h-10 sm:h-11 pl-10 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !email || !name}
                className="w-full h-11 sm:h-12 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? "Submitting..." : "Join Pre-Order List"}
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">You'll receive:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                  10% exclusive discount when product launches
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                  Priority access before general availability
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                  Launch notification via email
                </li>
              </ul>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-2">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              You're on the list!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 px-2">
              We'll email you when <strong>{productName}</strong> is available with your 10% discount code.
            </p>
            <Button 
              onClick={handleClose}
              className="w-full h-11 sm:h-12 bg-black text-white font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}