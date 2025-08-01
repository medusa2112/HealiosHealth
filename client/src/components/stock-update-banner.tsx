import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';

export function StockUpdateBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Always show the banner on every visit - remove session storage check
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
      // Remove session storage since banner should appear on every visit
    }, 300); // Match the animation duration
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 bg-amber-50 text-amber-900 px-4 py-3 shadow-lg transition-transform duration-500 border-b border-amber-200 ${
        isClosing ? '-translate-y-full' : isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Package className="h-5 w-5 text-amber-800 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-900">
                Stock Update: New inventory arriving August 10th
              </p>
              <p className="text-xs text-amber-700 hidden sm:block">
                Pre-order now and save 10% on out-of-stock items
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-amber-100 transition-colors duration-200 flex-shrink-0"
            aria-label="Close stock update notification"
          >
            <X className="h-4 w-4 text-amber-800" />
          </button>
        </div>
      </div>
      {/* Spacer to push content down when banner is visible */}
      {isVisible && !isClosing && <div className="h-16"></div>}
    </>
  );
}