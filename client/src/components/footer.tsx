import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading text-xl font-bold text-dark-text mb-4">WILD</h3>
            <p className="text-gray-600 text-sm mb-4">
              Premium nutrition made simple. Scientifically-backed supplements for your health journey.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-dark-text mb-4">Products</h4>
            <ul className="space-y-2">
              <li><Link href="/products/category/vitamins"><span className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Multivitamins</span></Link></li>
              <li><Link href="/products/category/supplements"><span className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Omega-3</span></Link></li>
              <li><Link href="/products/category/probiotics"><span className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Probiotics</span></Link></li>
              <li><Link href="/products/category/protein"><span className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Protein</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-dark-text mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about"><span className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">About Us</span></Link></li>
              <li><Link href="/reviews"><span className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Reviews</span></Link></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-dark-text mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">FAQ</a></li>
              <li><Link href="/contact"><span className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Contact</span></Link></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Shipping</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-yellow transition-colors duration-200">Returns</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © 2024 Wild Nutrition. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
