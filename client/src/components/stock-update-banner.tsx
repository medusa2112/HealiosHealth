import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';

export function StockUpdateBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner in this session
    const dismissed = sessionStorage.getItem('stockUpdateDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Auto-open after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsDismissed(true);
      sessionStorage.setItem('stockUpdateDismissed', 'true');
    }, 300); // Match the animation duration
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 bg-black text-white px-4 py-3 shadow-lg transition-transform duration-500 ${
        isClosing ? '-translate-y-full' : isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Package className="h-5 w-5 text-white flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                Stock Update: New inventory arriving August 10th
              </p>
              <p className="text-xs text-gray-300 hidden sm:block">
                Pre-order now and save 10% on out-of-stock items
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors duration-200 flex-shrink-0"
            aria-label="Close stock update notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Spacer to push content down when banner is visible */}
      {isVisible && !isClosing && <div className="h-16"></div>}
    </>
  );
}