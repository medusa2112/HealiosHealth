import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, ChevronDown, User } from "lucide-react";
import { FaInstagram, FaFacebook, FaGoogle } from "react-icons/fa";
import { SiTrustpilot } from "react-icons/si";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import healiosLogo from "@assets/healios-health27.png";

export function Header() {
  const [location, setLocation] = useLocation();
  const { toggleCart, getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

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
        { href: "/products/collagen-powder", label: "HALO Glow Collagen", isNew: true },
        { href: "/products/magnesium-bisglycinate-b6", label: "Magnesium Complex" },
        { href: "/products/vitamin-d3", label: "Vitamin D3" },
        { href: "/products/probiotics", label: "Probiotic Complex" },
        { href: "/products/apple-cider-vinegar", label: "Apple Cider Vinegar and Ginger Gummies" },
        { href: "/products/ashwagandha", label: "Ashwagandha" },
      ]
    },
    {
      title: "By Category", 
      items: [
        { href: "/products?filter=gummies", label: "Gummies" },
        { href: "/products?filter=vitamins", label: "Vitamins" },
        { href: "/products?filter=adaptogens", label: "Adaptogens" },
        { href: "/products?filter=probiotics", label: "Probiotics" },
        { href: "/products?filter=minerals", label: "Minerals" },
        { href: "/products?filter=prenatal", label: "Women's Health" },
        { href: "/products?filter=children", label: "Children's Health", comingSoon: true },
        { href: "/products?filter=beauty", label: "Beauty & Wellness" },
        { href: "/products?filter=prenatal", label: "Pregnancy & Pre-natal", comingSoon: true },
      ] as Array<{ href: string; label: string; isNew?: boolean; comingSoon?: boolean }>
    },
    {
      title: "Wellness Goals",
      items: [
        { href: "/products/probiotics", label: "Digestive Support" },
        { href: "/products/probiotic-vitamins", label: "Gut + Immune Support" },
        { href: "/products/iron-vitamin-c", label: "Energy & Focus" },
        { href: "/products/folic-acid-400", label: "Pre-pregnancy support", comingSoon: true },
        { href: "/products/ashwagandha", label: "Stress Management" },
        { href: "/products/magnesium", label: "Sleep & Muscle Support" },
        { href: "/products/vitamin-d3", label: "Immune Support" },
        { href: "/products/biotin-5000", label: "Hair, Skin & Nails" },
        { href: "/products/collagen-powder", label: "Hair, Skin & Nails - HALO Glow Collagen" },
        { href: "/products/collagen-complex", label: "Beauty & Anti-Aging" },
        { href: "/products/collagen-powder", label: "Beauty & Anti-Aging - HALO Glow Collagen" },
        { href: "/products/childrens-multivitamin", label: "Children's Development", comingSoon: true },
        { href: "/products/apple-cider-vinegar", label: "Metabolic Support" },
      ] as Array<{ href: string; label: string; isNew?: boolean; comingSoon?: boolean }>
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
        { href: "/journal/magnesium-for-sleep-clinical-evidence-benefits", label: "Magnesium for Sleep: Clinical Evidence" },
        { href: "/journal/ashwagandha-ancient-medicine-meets-modern-science-20250803", label: "Ashwagandha: Ancient Medicine Meets Modern Science" },
        { href: "/journal/collagen-benefits-backed-by-research", label: "Collagen Benefits Backed by Research" },
        { href: "/journal/vitamin-d-and-mood-what-research-shows", label: "Vitamin D and Mood: What Research Shows" },
        { href: "/journal/probiotic-benefits-evidence-based-health-support-20250803", label: "Probiotic Benefits: Evidence-Based Support" },
        { href: "/journal/all", label: "All Evidence-Based Articles" },
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
              <Link href="/products">
                <button className={`font-medium text-white hover:text-gray-300 transition-all duration-200 flex items-center gap-1 ${
                  isScrolled ? 'text-xs' : 'text-sm'
                }`}>
                  Shop
                  <ChevronDown className="h-3 w-3" />
                </button>
              </Link>
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

            {/* Auth removed - no user account menu */}

          </div>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-2">
            {/* Social Icons */}
            <div className="hidden sm:flex items-center space-x-2">
              <a
                href="https://g.co/kgs/EpVioa6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#4285F4] transition-colors duration-200 p-1"
                title="Google Reviews"
              >
                <FaGoogle className={`transition-all duration-300 ${
                  isScrolled ? 'h-3 w-3' : 'h-4 w-4'
                }`} />
              </a>
              <a
                href="https://www.trustpilot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#00B67A] transition-colors duration-200 p-1"
                title="Trustpilot"
              >
                <SiTrustpilot className={`transition-all duration-300 ${
                  isScrolled ? 'h-3 w-3' : 'h-4 w-4'
                }`} />
              </a>
              <a
                href="https://www.instagram.com/thehealios_?igsh=Nzgxc242a2JoODF2&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#E4405F] transition-colors duration-200 p-1"
                title="Instagram"
              >
                <FaInstagram className={`transition-all duration-300 ${
                  isScrolled ? 'h-3 w-3' : 'h-4 w-4'
                }`} />
              </a>
              <a
                href="https://www.facebook.com/share/1AhXK9ZyU5/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#1877F2] transition-colors duration-200 p-1"
                title="Facebook"
              >
                <FaFacebook className={`transition-all duration-300 ${
                  isScrolled ? 'h-3 w-3' : 'h-4 w-4'
                }`} />
              </a>
            </div>
            
            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-transparent hover:text-healios-cyan transition-colors duration-200"
                >
                  <User className={`transition-all duration-300 ${
                    isScrolled ? 'h-4 w-4' : 'h-5 w-5'
                  }`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                {user ? (
                  <>
                    <DropdownMenuItem className="text-sm font-medium">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => setLocation('/admin')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setLocation('/portal')}>
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/orders')}>
                      Order History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setLocation('/login')}>
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/register')}>
                      Create Account
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
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
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
                  <SheetClose asChild>
                    <Link href="/products">
                      <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                        Shop
                      </span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/quiz">
                      <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                        Supplement Quiz
                      </span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/about">
                      <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                        About
                      </span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/science">
                      <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                        Science
                      </span>
                    </Link>
                  </SheetClose>
                  
                  {/* Mobile User Menu */}
                  <div className="border-t border-gray-700 mt-4 pt-4">
                    {user ? (
                      <>
                        <p className="px-3 py-2 text-sm text-gray-400">{user.email}</p>
                        {user.role === 'admin' && (
                          <SheetClose asChild>
                            <Link href="/admin">
                              <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                                Admin Dashboard
                              </span>
                            </Link>
                          </SheetClose>
                        )}
                        <SheetClose asChild>
                          <Link href="/portal">
                            <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                              My Account
                            </span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/orders">
                            <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                              Order History
                            </span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:text-gray-300"
                          >
                            Sign Out
                          </button>
                        </SheetClose>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link href="/login">
                            <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                              Sign In
                            </span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/register">
                            <span className="block px-3 py-2 text-base font-medium text-white hover:text-gray-300">
                              Create Account
                            </span>
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
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
                        <span className="text-sm text-white hover:text-healios-cyan transition-colors duration-200 flex items-center gap-2">
                          {item.label}
                          {item.isNew && (
                            <span className="text-[10px] font-semibold text-white bg-emerald-500 px-1 py-px uppercase tracking-wide">
                              NEW
                            </span>
                          )}
                          {item.comingSoon && (
                            <span className="text-[10px] font-semibold text-white bg-black border border-white px-1 py-px uppercase tracking-wide">
                              SOON
                            </span>
                          )}
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
                  src="/@assets/healios-health44.png" 
                  alt="Best Seller - Magnesium" 
                  className="w-full h-24 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white mb-2">
                    Best Seller
                  </h3>
                  <p className="text-xs text-gray-300 mb-3">
                    Magnesium Complex
                  </p>
                  <Link href="/products/magnesium-bisglycinate-b6">
                    <button className="text-healios-cyan text-xs font-medium hover:text-healios-cyan/80 transition-colors">
                      Shop Now →
                    </button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-gray-900 overflow-hidden">
                <img 
                  src="/@assets/healios-health11.png" 
                  alt="New Product Alert - Collagen Powder" 
                  className="w-full h-24 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white mb-2">
                    New Product Alert
                  </h3>
                  <p className="text-xs text-gray-300 mb-3">
                    HALO Glow Collagen Powder
                  </p>
                  <Link href="/products/collagen-powder">
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

    </header>
  );
}