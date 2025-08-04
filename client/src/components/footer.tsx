import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Shop Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?filter=gummies" className="hover:text-white transition-colors">Gummies</Link></li>
              <li><Link href="/products?filter=vitamins" className="hover:text-white transition-colors">Vitamins</Link></li>
              <li><Link href="/products?filter=adaptogens" className="hover:text-white transition-colors">Adaptogens</Link></li>
              <li><Link href="/products?filter=probiotics" className="hover:text-white transition-colors">Probiotics</Link></li>
              <li><Link href="/products?filter=minerals" className="hover:text-white transition-colors">Minerals</Link></li>
              <li><Link href="/products?filter=beauty" className="hover:text-white transition-colors">Beauty & Skin</Link></li>
              <li><Link href="/products?filter=womens-health" className="hover:text-white transition-colors">Women's Health</Link></li>
            </ul>
          </div>

          {/* Learn Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Learn</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About Healios</Link></li>
              <li><Link href="/science" className="hover:text-white transition-colors">The Science</Link></li>
              <li><Link href="/journal/all" className="hover:text-white transition-colors">Healios Journal</Link></li>
              <li><span className="text-gray-500 cursor-not-allowed">For Practitioners (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Healios Sessions Podcast (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Support</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/quiz" className="hover:text-white transition-colors">Supplement Quiz</Link></li>
              <li><span className="text-gray-500 cursor-not-allowed">FAQ (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Shipping & Returns (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Terms & Conditions (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/planet" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><span className="text-gray-500 cursor-not-allowed">Careers (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Privacy Policy (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Newsletter (Coming Soon)</span></li>
              <li><span className="text-gray-500 cursor-not-allowed">Affiliate Program (Coming Soon)</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span className="text-sm text-gray-400">🇿🇦 SOUTH AFRICA (ZAR)</span>
            <button className="text-xs text-gray-400 uppercase tracking-wide hover:text-white transition-colors">
              CHANGE
            </button>
          </div>

          <p className="text-sm text-gray-400">
            © 2025 Healios Ltd
          </p>
        </div>
      </div>
    </footer>
  );
}
