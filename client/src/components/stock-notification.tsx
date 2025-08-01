import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import haloGlowImage from '@assets/20250718_1126_Collagen Pouch Oasis_remix_01k0edj6avexgr8xadn8ch16cv_1754074058203.png';

export function StockNotification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNotifyMe = () => {
    // Add notification signup logic here
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-sm w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header with product image */}
        <div className="relative h-80 bg-gradient-to-br from-teal-100 to-blue-100">
          <img 
            src={haloGlowImage}
            alt="Halo Glow Collagen"
            className="w-full h-full object-cover"
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
            Our new <strong>Halo Glow</strong> premium collagen product has completely sold out due to incredible demand.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">
              <strong>New stock arriving:</strong>
            </p>
            <p className="text-lg font-semibold text-black">
              August 28th • 500 units
            </p>
          </div>

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
              className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}