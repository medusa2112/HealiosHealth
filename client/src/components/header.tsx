import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import healiosLogo from "@assets/healios-logo (1)_1753466737582.png";

export function Header() {
  const [location] = useLocation();
  const { toggleCart, getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  
  const totalItems = getTotalItems();

  // Healios-specific navigation structure
  const shopSections = [
    {
      title: "BESTSELLERS",
      items: [
        { href: "/products/multivitamin", label: "Daily Multivitamin" },
        { href: "/products/omega-3", label: "Omega-3 Complex" },
        { href: "/products/vitamin-d", label: "Vitamin D3" },
        { href: "/products/magnesium", label: "Magnesium" },
      ]
    },
    {
      title: "VITAMINS & MINERALS",
      items: [
        { href: "/products/vitamin-c", label: "Vitamin C" },
        { href: "/products/b-complex", label: "B-Complex" },
        { href: "/products/zinc", label: "Zinc" },
        { href: "/products/iron", label: "Iron" },
      ]
    },
    {
      title: "BY HEALTH GOAL",
      items: [
        { href: "/products/energy", label: "Energy Support" },
        { href: "/products/sleep", label: "Sleep & Recovery" },
        { href: "/products/immunity", label: "Immune Support" },
        { href: "/products/beauty", label: "Beauty & Skin" },
      ]
    },
    {
      title: "SPECIALTY",
      items: [
        { href: "/products/prenatal", label: "Prenatal Support" },
        { href: "/products/men", label: "Men's Health" },
        { href: "/products/women", label: "Women's Health" },
        { href: "/products", label: "Shop All" },
      ]
    }
  ];

  const learnSections = [
    {
      title: "ABOUT HEALIOS",
      items: [
        { href: "/about", label: "Our Story" },
        { href: "/science", label: "The Science" },
        { href: "/sustainability", label: "Sustainability" },
        { href: "/careers", label: "Careers" },
      ]
    },
    {
      title: "RESOURCES",
      items: [
        { href: "/blog", label: "Health Blog" },
        { href: "/guides", label: "Nutrition Guides" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact Us" },
      ]
    }
  ];

  const isActiveLink = (href: string) => location === href;

  return (
    <header className="bg-black sticky top-0 z-50">
      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Shop Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <button className="text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200 flex items-center gap-1">
                SHOP
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            
            {/* Other Navigation Items */}
            <Link href="/quiz">
              <span className="text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200">
                SUPPLEMENT QUIZ
              </span>
            </Link>
            
            <Link href="/consultation">
              <span className="text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200">
                BOOK A CONSULTATION
              </span>
            </Link>
            
            {/* Learn Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsLearnDropdownOpen(true)}
              onMouseLeave={() => setIsLearnDropdownOpen(false)}
            >
              <button className="text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200 flex items-center gap-1">
                LEARN
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          {/* Healios Logo - Centered */}
          <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/">
              <img 
                src={healiosLogo}
                alt="Healios"
                className="h-8 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-48 bg-gray-800 border-gray-600 text-white placeholder:text-gray-300"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-white hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-white hover:text-gray-300"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-white hover:text-gray-300"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="text-white hover:text-gray-300 relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-healios-cyan text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Button>
            
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-white hover:text-gray-300"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-gray-700">
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link href="/products">
                    <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                      Shop
                    </span>
                  </Link>
                  <Link href="/quiz">
                    <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                      Supplement Quiz
                    </span>
                  </Link>
                  <Link href="/consultation">
                    <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                      Consultation
                    </span>
                  </Link>
                  <Link href="/about">
                    <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                      About
                    </span>
                  </Link>
                  <Link href="/science">
                    <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                      Science
                    </span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      
      {/* Shop Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 w-full bg-black border-t border-gray-800 transition-all duration-300 ${
          isShopDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onMouseEnter={() => setIsShopDropdownOpen(true)}
        onMouseLeave={() => setIsShopDropdownOpen(false)}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {shopSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link href={item.href}>
                        <span className="text-sm text-white hover:text-healios-cyan transition-colors duration-200">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="bg-healios-gradient-2 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                Not sure where to start?
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Take our 60-second quiz for personalized recommendations
              </p>
              <Link href="/quiz">
                <button className="bg-white text-black px-6 py-2 text-sm font-medium rounded hover:bg-gray-100 transition-colors">
                  Take the Quiz →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Learn Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 w-full bg-black border-t border-gray-800 transition-all duration-300 ${
          isLearnDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onMouseEnter={() => setIsLearnDropdownOpen(true)}
        onMouseLeave={() => setIsLearnDropdownOpen(false)}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {learnSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link href={item.href}>
                        <span className="text-sm text-white hover:text-healios-cyan transition-colors duration-200">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Featured Content */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  The Science Behind Healios
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Discover our evidence-based approach to nutrition and wellness
                </p>
                <Link href="/science">
                  <button className="text-healios-cyan text-sm font-medium hover:text-healios-cyan/80 transition-colors">
                    Learn More →
                  </button>
                </Link>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  Book a Free Consultation
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Get personalized nutrition advice from our expert team
                </p>
                <Link href="/consultation">
                  <button className="text-healios-cyan text-sm font-medium hover:text-healios-cyan/80 transition-colors">
                    Book Now →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}