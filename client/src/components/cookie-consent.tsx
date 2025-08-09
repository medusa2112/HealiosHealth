import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Shield, BarChart } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('healios-cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('healios-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    }));
    setIsVisible(false);
    // Enable analytics and marketing cookies here
    enableCookies(['analytics', 'marketing']);
  };

  const acceptNecessary = () => {
    localStorage.setItem('healios-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    }));
    setIsVisible(false);
    // Only enable necessary cookies
    enableCookies(['necessary']);
  };

  const enableCookies = (types: string[]) => {
    // This would integrate with your analytics/marketing tools
    console.log('Enabling cookies:', types);
    
    // Example: Enable Google Analytics if analytics consent given
    if (types.includes('analytics')) {
      // Initialize GA here
    }
    
    // Example: Enable marketing pixels if marketing consent given
    if (types.includes('marketing')) {
      // Initialize marketing tools here
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border shadow-lg">
        <CardContent className="p-6">
          {!showDetails ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    We use cookies to enhance your experience
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We use essential cookies for site functionality and optional cookies for analytics and marketing. 
                    You can choose which cookies to accept.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                  className="whitespace-nowrap"
                >
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                  className="whitespace-nowrap"
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="whitespace-nowrap bg-black text-white hover:bg-gray-800"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Cookie Preferences
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Essential Cookies <span className="text-green-600">(Always Active)</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      These cookies are necessary for the website to function and cannot be disabled. 
                      They include session cookies, security tokens, and shopping cart functionality.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <BarChart className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Help us understand how visitors interact with our website by collecting anonymous information.
                      This helps us improve our service and user experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Cookie className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Marketing Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Used to deliver personalized advertisements and track the effectiveness of our marketing campaigns.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-6 md:flex-row md:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Accept All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}