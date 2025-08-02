import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import { PreOrderModal } from './pre-order-modal';

export function StockUpdateBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  useEffect(() => {
    // Always show the banner on every visit - remove session storage check
    // Auto-open after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-close after 7 seconds when banner becomes visible
    if (isVisible && !isClosing) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 7000);

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isVisible, isClosing]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsDismissed(true);
      // Remove session storage since banner should appear on every visit
    }, 300); // Match the animation duration
  };

  const handleBannerClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking the close button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setShowPreOrderModal(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-white text-black px-4 py-3 shadow-lg transition-transform duration-500 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
          isClosing ? '-translate-y-full' : isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onClick={handleBannerClick}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Package className="h-5 w-5 text-black flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-black">
                Stock Update: New inventory arriving August 28th
              </p>
              <p className="text-xs text-gray-600 hidden sm:block">
                Pre-order now and save 10% on out-of-stock items
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
            aria-label="Close stock update notification"
          >
            <X className="h-4 w-4 text-black" />
          </button>
        </div>
      </div>
      {/* Spacer to push content down when banner is visible */}
      {isVisible && !isClosing && <div className="h-16"></div>}
      
      {/* Pre-Order Modal */}
      <PreOrderModal
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
        productName="New Stock - Multiple Products"
        productId="stock-update-banner"
      />
    </>
  );
}