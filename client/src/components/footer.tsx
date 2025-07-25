import { useState } from "react";
import { Link } from "wouter";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <footer className="bg-gray-100 py-10">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Navigation Column */}
          <div>
            <h4 className="font-heading font-semibold text-darkText mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products">
                  <span className="text-gray-600 hover:text-darkText transition-colors">Shop</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-gray-600 hover:text-darkText transition-colors">About</span>
                </Link>
              </li>
              <li>
                <Link href="/science">
                  <span className="text-gray-600 hover:text-darkText transition-colors">Science</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Help Column */}
          <div>
            <h4 className="font-heading font-semibold text-darkText mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-darkText transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-darkText transition-colors">Shipping</a>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-gray-600 hover:text-darkText transition-colors">Contact</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter Column */}
          <div>
            <h4 className="font-heading font-semibold text-darkText mb-4">Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">
              Stay updated with our latest products and health tips.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brandYellow focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-2 px-6 py-2 bg-brandYellow text-darkText rounded-full text-sm font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>© WildClone 2025. All rights reserved.</p>
            <div className="mt-2 md:mt-0 space-x-4">
              <a href="#" className="hover:text-darkText transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-darkText transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
