import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, ChevronDown, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import healiosLogo from "@assets/healios-logo (1)_1753466737582.png";
import { LearningPopup } from './learning-popup';
import { AssistantSidebar } from './assistant-sidebar';

export function Header() {
  const [location] = useLocation();
  const { toggleCart, getTotalItems } = useCart();
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  const totalItems = getTotalItems();

  // Handle scroll to shrink header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Authentic Healios product navigation structure
  const shopSections = [
    {
      title: "Bestsellers",
      items: [
        { href: "/products/apple-cider-vinegar", label: "Apple Cider Vinegar Gummies" },
        { href: "/products/vitamin-d3", label: "Vitamin D3 4000 IU Gummies" },
        { href: "/products/magnesium", label: "Magnesium Gummies" },
        { href: "/products/mind-memory-mushroom", label: "Mind & Memory Mushroom Gummies" },
        { href: "/products/biotin-5000", label: "Biotin 5000µg Strawberry Gummies" },
        { href: "/products/childrens-multivitamin", label: "Children's Multivitamin Gummies" },
      ]
    },
    {
      title: "By Category",
      items: [
        { href: "/products?category=gummies", label: "Gummies" },
        { href: "/products?category=vitamins", label: "Vitamins" },
        { href: "/products?category=adaptogens", label: "Adaptogens" },
        { href: "/products?category=probiotics", label: "Probiotics" },
        { href: "/products?category=minerals", label: "Minerals" },
        { href: "/products?category=children", label: "Children's Health" },
        { href: "/products?category=beauty", label: "Beauty & Wellness" },
        { href: "/products?category=prenatal", label: "Pre-Pregnancy & Prenatal" },
      ]
    },
    {
      title: "Wellness Goals",
      items: [
        { href: "/products/probiotics", label: "Digestive Support" },
        { href: "/products/probiotic-vitamins", label: "Gut + Immune Support" },
        { href: "/products/iron-vitamin-c", label: "Energy & Focus" },
        { href: "/products/folic-acid-400", label: "Pre-Pregnancy Support" },
        { href: "/products/ashwagandha", label: "Stress Management" },
        { href: "/products/magnesium", label: "Sleep & Muscle Support" },
        { href: "/products/vitamin-d3", label: "Immune Support" },
        { href: "/products/biotin-5000", label: "Hair, Skin & Nails" },
        { href: "/products/collagen-complex", label: "Beauty & Anti-Aging" },
        { href: "/products/childrens-multivitamin", label: "Children's Development" },
        { href: "/products/apple-cider-vinegar", label: "Metabolic Support" },
      ]
    },
    {
      title: "All Products",
      items: [
        { href: "/products", label: "Shop All Products" },
        { href: "/quiz", label: "Take Our Wellness Quiz" },

      ]
    }
  ];

  const learnSections = [
    {
      title: "About Healios",
      items: [
        { href: "/about", label: "Our Story" },
        { href: "/science", label: "The Science-Backed difference" },
        { href: "/planet", label: "Healing our Planet Partnerships" },
      ]
    },
    {
      title: "The Science",
      items: [
        { href: "/science/research", label: "Research & Clinical Studies" },
      ]
    },


    {
      title: "Healios Journal",
      items: [
        { href: "/journal", label: "Longevity & why nutrition is key" },
        { href: "/journal/collagen", label: "Collagen 500 Plus Q+A with Henrietta Norton" },
        { href: "/journal/weight", label: "Weight Management at every lifestage" },
        { href: "/journal/ashwagandha", label: "5 healthy benefits of Ashwagandha" },
        { href: "/journal/recipes", label: "The Wild Kitchen recipes" },
        { href: "/journal/all", label: "All blog posts" },
      ]
    },

  ];

  const isActiveLink = (href: string) => location === href;

  return (
    <header className="bg-black sticky top-0 z-50 transition-all duration-300">
      {/* Main Navigation Bar */}
      <nav className={`max-w-7xl mx-auto px-6 transition-all duration-300 ${
        isScrolled ? 'py-1' : 'py-2'
      }`}>
        <div className="flex justify-between items-center">
          {/* Left Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <img 
                src={healiosLogo}
                alt="Healios"
                className={`w-auto hover:opacity-80 transition-all duration-300 ${
                  isScrolled ? 'h-5' : 'h-6'
                }`}
              />
            </Link>
          </div>
          
          {/* Center Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Shop Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <button className={`font-medium text-white hover:text-gray-300 transition-all duration-200 flex items-center gap-1 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>
                Shop
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            
            {/* Learn Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsLearnDropdownOpen(true)}
              onMouseLeave={() => setIsLearnDropdownOpen(false)}
            >
              <button className={`font-medium text-white hover:text-gray-300 transition-all duration-200 flex items-center gap-1 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>
                Learn
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            
            <Link href="/quiz">
              <span className={`font-medium text-white hover:text-gray-300 transition-all duration-200 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>
                Supplement Quiz
              </span>
            </Link>
            

          </div>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-2">
            {/* Assistant */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAssistantOpen(true)}
              className="text-white hover:bg-transparent hover:text-healios-cyan transition-colors duration-200"
            >
              <MessageCircle className={`transition-all duration-300 ${
                isScrolled ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="text-white hover:bg-transparent hover:text-healios-cyan relative transition-colors duration-200"
            >
              <ShoppingBag className={`transition-all duration-300 ${
                isScrolled ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-healios-cyan text-black text-xs font-bold min-w-5 h-5 flex items-center justify-center px-1 transition-all duration-300`}>
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
                  className="lg:hidden text-white hover:bg-black hover:text-healios-violet transition-colors duration-200"
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
        className={`absolute top-full bg-black border border-gray-800 shadow-2xl transition-all duration-300 ${
          isShopDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          maxWidth: '90vw'
        }}
        onMouseEnter={() => setIsShopDropdownOpen(true)}
        onMouseLeave={() => setIsShopDropdownOpen(false)}
      >
        <div className="px-6 py-6">
          <div className="grid grid-cols-4 gap-6">
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
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="bg-healios-gradient-2 p-4 text-center">
              <h3 className="text-base font-medium text-white mb-2">
                Not sure where to start?
              </h3>
              <p className="text-xs text-white/80 mb-3">
                Take our 60-second quiz for personalized recommendations
              </p>
              <Link href="/quiz">
                <button className="bg-white text-black px-4 py-2 text-xs font-medium hover:bg-gray-100 transition-colors">
                  Take the Quiz →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Learn Dropdown Menu */}
      <div 
        className={`absolute top-full bg-black border border-gray-800 shadow-2xl transition-all duration-300 ${
          isLearnDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          maxWidth: '85vw'
        }}
        onMouseEnter={() => setIsLearnDropdownOpen(true)}
        onMouseLeave={() => setIsLearnDropdownOpen(false)}
      >
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            {learnSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link href={item.href}>
                        <span className="text-sm text-white hover:text-healios-cyan transition-colors duration-200 leading-relaxed">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Featured Content with Images */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 overflow-hidden">
                <img 
                  src="/attached_assets/Healios_1753559079971.png" 
                  alt="Take our wellness quiz" 
                  className="w-full h-24 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white mb-2">
                    Need supplement guidance?
                  </h3>
                  <p className="text-xs text-gray-300 mb-3">
                    Take our personalized wellness quiz
                  </p>
                  <Link href="/quiz">
                    <button className="text-healios-cyan text-xs font-medium hover:text-healios-cyan/80 transition-colors">
                      Start Quiz →
                    </button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-gray-900 overflow-hidden">
                <img 
                  src="/attached_assets/he-has-some-valuable-information-to-share-2025-04-06-07-11-37-utc (1) (1)_1753546950153.jpg" 
                  alt="A new journey" 
                  className="w-full h-24 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white mb-2">
                    A new journey
                  </h3>
                  <p className="text-xs text-gray-300 mb-3">
                    Visit our pregnancy hub
                  </p>
                  <Link href="/pregnancy">
                    <button className="text-healios-cyan text-xs font-medium hover:text-healios-cyan/80 transition-colors">
                      Explore →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Learning Popup */}
      <LearningPopup />

      {/* Assistant Sidebar */}
      <AssistantSidebar 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
      />
    </header>
  );
}