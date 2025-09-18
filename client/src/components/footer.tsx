import { Link } from "wouter";
import { FaInstagram, FaFacebook, FaGoogle } from "react-icons/fa";
import { SiTrustpilot } from "react-icons/si";
import { LogIn } from "lucide-react";

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
              <li>
                <Link 
                  href="/#about" 
                  className="hover:text-white transition-colors"
                  data-testid="link-about-healios"
                  onClick={(e) => {
                    // If we're already on the home page, scroll to the about section
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Otherwise, navigate to home page with hash (handled by browser)
                  }}
                >
                  About Healios
                </Link>
              </li>
              <li><Link href="/science" className="hover:text-white transition-colors">The Science</Link></li>
              <li><Link href="/journal/all" className="hover:text-white transition-colors">Healios Journal</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Support</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/portal" className="hover:text-white transition-colors flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  My Account
                </Link>
              </li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/quiz" className="hover:text-white transition-colors">Supplement Quiz</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-medium mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link 
                  href="/#about" 
                  className="hover:text-white transition-colors"
                  data-testid="link-our-story"
                  onClick={(e) => {
                    // If we're already on the home page, scroll to the about section
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Otherwise, navigate to home page with hash (handled by browser)
                  }}
                >
                  Our Story
                </Link>
              </li>
              <li><Link href="/planet" className="hover:text-white transition-colors">Our Ocean Impact</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          {/* Social Media Icons */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              <a
                href="https://www.google.com/maps/place/The+Healios+Health+Ltd.+South+Africa/@-29.7125,-31.0125,17z/data=!4m6!3m5!1s0x1ef7a9ba9b5c2915:0x401cf31a9b81d796!8m2!3d-29.7125!4d-31.0125!16s%2Fg%2F11xdp_jh59"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#4285F4] transition-colors duration-200 p-2"
                title="Google Reviews"
                data-testid="link-google-reviews"
              >
                <FaGoogle className="h-5 w-5" />
              </a>
              <a
                href="https://www.trustpilot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#00B67A] transition-colors duration-200 p-2"
                title="Trustpilot"
              >
                <SiTrustpilot className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/thehealios_?igsh=Nzgxc242a2JoODF2&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#E4405F] transition-colors duration-200 p-2"
                title="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1AhXK9ZyU5/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#1877F2] transition-colors duration-200 p-2"
                title="Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Country and Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <span className="text-sm text-gray-400">🇿🇦 SOUTH AFRICA (ZAR)</span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © 2025 The Healios. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                RSA: 2024/676815/07 | UK: 16183276
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
