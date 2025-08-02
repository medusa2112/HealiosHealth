import { useState, useEffect } from 'react';
import { X, Package, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import haloGlowImage from '@assets/HaloGlowB_1754157621693.png';

export function StockNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Clear localStorage for testing - TEMPORARY
    localStorage.removeItem('halo-glow-notification-shown');
    
    // Show notification after 3 seconds for testing
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    console.log('Close button clicked'); // Debug log
    setIsVisible(false);
    setShowEmailForm(false);
  };

  const handleNotifyMe = () => {
    setShowEmailForm(true);
  };

  const handleSubmitNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both your first name and email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/notify-restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          product: 'Halo Glow Collagen',
          restockDate: 'August 28th'
        }),
      });

      if (response.ok) {
        toast({
          title: "You're on the list!",
          description: "We'll notify you as soon as Halo Glow is back in stock."
        });
        setIsVisible(false);
        setShowEmailForm(false);
      } else {
        throw new Error('Failed to submit notification request');
      }
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative max-w-sm w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            console.log('Close button onClick triggered'); // Debug log
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          onTouchEnd={(e) => {
            console.log('Close button onTouchEnd triggered'); // Debug log
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-1 right-1 z-[60] p-3 m-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors touch-manipulation min-w-[50px] min-h-[50px] flex items-center justify-center shadow-xl border-2 border-white"
          aria-label="Close notification"
          type="button"
          style={{ touchAction: 'manipulation' }}
        >
          <X className="w-7 h-7 text-white stroke-[3]" />
        </button>

        {/* Header with product image */}
        <div className="relative h-80 bg-gradient-to-br from-teal-100 to-blue-100 overflow-hidden">
          <img 
            src={haloGlowImage}
            alt="Halo Glow Collagen"
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out md:hover:scale-150 cursor-pointer"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-500 uppercase tracking-wide">
              Product Update
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-black mb-2">
            Halo Glow Sold Out!
          </h3>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Thanks to your incredible support, demand for our <strong>Halo Glow</strong> premium collagen exceeded all expectations - every unit is now sold out.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">
                  Restock Date
                </p>
                <p className="text-lg font-bold text-black">
                  August 28th
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">
                  Quantity
                </p>
                <p className="text-lg font-bold text-black">
                  500 units
                </p>
              </div>
            </div>
          </div>

          {!showEmailForm ? (
            <div className="flex gap-3">
              <Button
                onClick={handleNotifyMe}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                Notify Me
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-black"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3">
              <form onSubmit={handleSubmitNotification} className="space-y-3">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="pl-10 h-9 text-sm border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="pl-10 h-9 text-sm border-gray-300 focus:border-black focus:ring-black"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-9 bg-black hover:bg-gray-800 text-white disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Notify Me'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    variant="outline"
                    className="px-4 h-9 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-black text-sm"
                  >
                    Back
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}