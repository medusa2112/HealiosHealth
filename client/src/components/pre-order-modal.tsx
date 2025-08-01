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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/pre-orders", {
        email,
        productId,
        productName,
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
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-healios-cyan/10 dark:bg-healios-cyan/20 flex items-center justify-center mb-4">
                <Percent className="w-8 h-8 text-healios-cyan" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Get 10% Off When Available
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <strong>{productName}</strong> will be restocking soon. Secure your spot in line and save 10% on your order when new stock arrives on August 10th.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="pl-10 border-gray-300 dark:border-gray-600 focus:border-healios-cyan focus:ring-healios-cyan"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !email}
                className="w-full bg-black text-white font-medium py-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Join Pre-Order List"}
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">You'll receive:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-healios-cyan mr-3 flex-shrink-0"></div>
                  10% exclusive discount when product launches
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-healios-cyan mr-3 flex-shrink-0"></div>
                  Priority access before general availability
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-healios-cyan mr-3 flex-shrink-0"></div>
                  Launch notification via email
                </li>
              </ul>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              You're on the list!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              We'll email you when <strong>{productName}</strong> is available with your 10% discount code.
            </p>
            <Button 
              onClick={handleClose}
              className="w-full bg-black text-white font-medium py-3 hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}