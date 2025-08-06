import { Truck, Package, Shield, Globe, Clock, RefreshCw } from "lucide-react";

const regions = {
  southAfrica: {
    name: "South Africa",
    flag: "🇿🇦",
    shipping: {
      standard: "3-5 business days",
      express: "1-2 business days",
      freeThreshold: "R500"
    },
    returns: "30 days"
  },
  uk: {
    name: "United Kingdom", 
    flag: "🇬🇧",
    shipping: {
      standard: "3-5 business days",
      express: "1-2 business days", 
      freeThreshold: "£30"
    },
    returns: "30 days"
  },
  europe: {
    name: "Europe",
    flag: "🇪🇺", 
    shipping: {
      standard: "5-7 business days",
      express: "2-4 business days",
      freeThreshold: "€35"
    },
    returns: "30 days"
  }
};

function RegionSection({ region, data }: { region: string; data: typeof regions.southAfrica }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex items-center mb-6">
        <span className="text-3xl mr-3">{data.flag}</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Shipping */}
        <div>
          <div className="flex items-center mb-4">
            <Truck className="h-6 w-6 text-black dark:text-white mr-2" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Shipping</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Standard Delivery:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.shipping.standard}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Express Delivery:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.shipping.express}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Free Shipping:</span>
              <span className="font-medium text-gray-900 dark:text-white">Orders over {data.shipping.freeThreshold}</span>
            </div>
          </div>
        </div>

        {/* Returns */}
        <div>
          <div className="flex items-center mb-4">
            <RefreshCw className="h-6 w-6 text-black dark:text-white mr-2" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Returns</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Return Window:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.returns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Condition:</span>
              <span className="font-medium text-gray-900 dark:text-white">Unopened products</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Refund Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">5-10 business days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShippingReturns() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Shipping & Returns
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fast, reliable delivery to South Africa, UK, and Europe. Easy returns within 30 days.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Regional Information */}
        {Object.entries(regions).map(([key, data]) => (
          <RegionSection key={key} region={key} data={data} />
        ))}

        {/* General Policies */}
        <div className="bg-gray-50 dark:bg-gray-900 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Package className="h-6 w-6 mr-2" />
            Shipping Policies
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>• Orders are processed within 24-48 hours during business days</p>
            <p>• You'll receive tracking information once your order ships</p>
            <p>• Delivery times exclude weekends and public holidays</p>
            <p>• Rural or remote areas may experience extended delivery times</p>
            <p>• Orders placed before 2 PM qualify for same-day processing</p>
            <p>• Customs duties and taxes may apply for international orders</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Return Policy
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>• Products must be unopened and in original packaging</p>
            <p>• Return shipping costs are covered by Healios for defective products</p>
            <p>• Customer covers return shipping for change of mind returns</p>
            <p>• Refunds are processed to the original payment method</p>
            <p>• Products with broken seals cannot be returned for hygiene reasons</p>
            <p>• Return authorization required - contact us first</p>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              How to Return Products
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                <p className="text-gray-700 dark:text-gray-300">Contact our support team at marketing@thehealios.com to request a return authorization</p>
              </div>
              <div className="flex items-start">
                <div className="bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                <p className="text-gray-700 dark:text-gray-300">Package products securely in original packaging with return authorization number</p>
              </div>
              <div className="flex items-start">
                <div className="bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                <p className="text-gray-700 dark:text-gray-300">Ship to our returns address (provided with authorization)</p>
              </div>
              <div className="flex items-start">
                <div className="bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                <p className="text-gray-700 dark:text-gray-300">Refund processed within 5-10 business days after we receive your return</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <Globe className="h-6 w-6 mr-2" />
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our customer service team is available to help with shipping and return questions.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <a
              href="/contact"
              className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:marketing@thehealios.com"
              className="inline-block border-2 border-black dark:border-white text-black dark:text-white px-8 py-3 font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}