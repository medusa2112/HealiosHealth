import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [location] = useLocation();
  const { toggleCart, getTotalItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const totalItems = getTotalItems();

  const navItems = [
    { href: "/products", label: "Products" },
    { href: "/bundles", label: "Bundles" },
    { href: "/about", label: "About" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

  const isActiveLink = (href: string) => location === href;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="font-heading text-2xl font-bold text-dark-text">WILD</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span 
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActiveLink(item.href)
                        ? "text-brand-yellow"
                        : "text-dark-text hover:text-brand-yellow"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Search, Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-48"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-dark-text hover:text-brand-yellow"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            
            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCart}
              className="text-dark-text hover:text-brand-yellow relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-yellow text-dark-text text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
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
                  className="md:hidden text-dark-text hover:text-brand-yellow"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span 
                        className={`block px-3 py-2 text-base font-medium ${
                          isActiveLink(item.href)
                            ? "text-brand-yellow"
                            : "text-dark-text hover:text-brand-yellow"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
