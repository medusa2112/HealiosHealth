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
              <li><Link href="/products?category=bestsellers" className="hover:text-white transition-colors">Bestsellers</Link></li>
              <li><Link href="/products?category=energy" className="hover:text-white transition-colors">Energy & Focus</Link></li>
              <li><Link href="/products?category=sleep" className="hover:text-white transition-colors">Sleep & Recovery</Link></li>
              <li><Link href="/products?category=immunity" className="hover:text-white transition-colors">Immune Support</Link></li>
              <li><Link href="/products?category=digestive" className="hover:text-white transition-colors">Digestive Health</Link></li>
              <li><Link href="/products?category=stress" className="hover:text-white transition-colors">Stress Management</Link></li>
            </ul>
          </div>

          {/* Learn Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Learn</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About Healios</Link></li>
              <li><Link href="/science" className="hover:text-white transition-colors">The Science</Link></li>
              <li><Link href="/practitioners" className="hover:text-white transition-colors">For Practitioners</Link></li>
              <li><Link href="/womens-health" className="hover:text-white transition-colors">Women's Health</Link></li>
              <li><Link href="/journal" className="hover:text-white transition-colors">Healios Journal</Link></li>
              <li><Link href="/podcast" className="hover:text-white transition-colors">Healios Sessions Podcast</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Support</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/consultation" className="hover:text-white transition-colors">Book Consultation</Link></li>
              <li><Link href="/quiz" className="hover:text-white transition-colors">Supplement Quiz</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
              <li><Link href="/affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span className="text-sm text-gray-400">🇬🇧 UNITED KINGDOM (GBP £)</span>
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
