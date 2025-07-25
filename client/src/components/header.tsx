import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Menu, X, Sun, Moon } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [location] = useLocation();
  const { toggleCart, getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const totalItems = getTotalItems();

  const navItems = [
    { href: "/products", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/science", label: "Science" },
    { href: "/consultation", label: "Consultation" },
    { href: "/quiz", label: "Quiz" },
  ];

  const isActiveLink = (href: string) => location === href;

  return (
    <header className="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <nav className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Minimal Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 rounded tracking-tight"
                aria-label="WildClone Home"
              >
                WildClone
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span 
                    className={`text-sm font-medium transition-colors duration-200 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 rounded px-2 py-1 ${
                      isActiveLink(item.href)
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Search, Theme, Cart and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-darkText dark:text-white"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                  aria-label="Search products"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-darkText dark:text-gray-300 hover:text-brandYellow"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-darkText dark:text-gray-300 hover:text-brandYellow focus:ring-2 focus:ring-brandYellow"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-darkText dark:text-gray-300 hover:text-brandYellow focus:ring-2 focus:ring-brandYellow"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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
              className="text-darkText dark:text-gray-300 hover:text-brandYellow relative focus:ring-2 focus:ring-brandYellow"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brandYellow text-darkText text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
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
                  className="md:hidden text-darkText dark:text-gray-300 hover:text-brandYellow focus:ring-2 focus:ring-brandYellow"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span 
                        className={`block px-3 py-2 text-base font-medium transition-colors duration-200 hover:text-brandYellow focus:outline-none focus:ring-2 focus:ring-brandYellow rounded ${
                          isActiveLink(item.href)
                            ? "text-brandYellow"
                            : "text-darkText dark:text-gray-300"
                        }`}
                        aria-label={`Navigate to ${item.label}`}
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
