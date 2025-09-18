import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { SEOHead } from "@/components/seo-head";
import { Breadcrumb } from "@/components/breadcrumb";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // Map URL filter parameters to database category names
  const mapFilterToCategory = (filterParam: string): string => {
    const categoryMap: Record<string, string> = {
      'gummies': 'gummies',
      'vitamins': 'vitamins', 
      'adaptogens': 'adaptogens',
      'probiotics': 'probiotics',
      'minerals': 'minerals',
      'beauty': 'beauty',
      'womens-health': 'prenatal' // Map women's health to prenatal category
    };
    
    return categoryMap[filterParam] || filterParam;
  };

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache for products
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  // Parse URL parameters reliably using window.location.search
  const parseUrlParameters = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam) {
      const mappedCategory = mapFilterToCategory(filterParam);
      setSelectedCategory(mappedCategory);
    } else {
      setSelectedCategory('All');
    }
  }, []);

  // Process URL parameters on component mount and handle navigation changes
  useEffect(() => {
    // Initial parse of URL parameters
    parseUrlParameters();

    // Listen for browser navigation changes (back/forward buttons)
    const handlePopState = () => {
      parseUrlParameters();
    };

    // Listen for hash changes (though this is more for future extensibility)
    const handleHashChange = () => {
      parseUrlParameters();
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [parseUrlParameters]);

  // Dynamically generate categories from actual products in database - memoized for performance
  const categories = useMemo(() => {
    if (!products) return ["All"];
    
    const categorySet = new Set<string>();
    products.forEach(product => {
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(cat => categorySet.add(cat));
      }
    });
    
    // Sort categories alphabetically but keep "All" first
    const sortedCategories = Array.from(categorySet).sort();
    return ["All", ...sortedCategories];
  }, [products]);

  // Get product count for each category
  const getCategoryCount = (category: string) => {
    if (!products) return 0;
    if (category === "All") return products.length;
    
    return products.filter(product => 
      product.categories && 
      Array.isArray(product.categories) && 
      product.categories.includes(category)
    ).length;
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (category === "All") return "All";
    // Convert hyphenated names to proper case
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if product matches selected category
      const matchesCategory = selectedCategory === "All" || 
                             (product.categories && Array.isArray(product.categories) && 
                              product.categories.includes(selectedCategory));
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Optimize sorting with useMemo to prevent unnecessary re-computation
  const sortedProducts = useMemo(() => {
    if (!filteredProducts.length) return [];
    
    return [...filteredProducts].sort((a, b) => {
      // First priority: availability (already computed on server)
      if (a.availability !== b.availability) {
        const order = { 'in_stock': 0, 'preorder_open': 1, 'out_of_stock': 2 };
        return order[a.availability] - order[b.availability];
      }
      
      // Second priority: apply the selected sort criteria
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "rating":
          return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [filteredProducts, sortBy]);

  const productsStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Food-Grown® Supplements & Natural Vitamins",
    "description": "Shop our complete range of quality wellness supplements. Premium natural vitamins and supplements for daily wellness support.",
    "url": "https://thehealios.com/products",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://wildclone.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Products",
          "item": "https://wildclone.com/products"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead
        title="Premium Supplements & Natural Vitamins | Shop All Products | Healios"
        description="Shop our complete range of science-backed supplements designed for optimal wellness. Premium natural vitamins and supplements for daily wellness support. Free shipping on orders R25+."
        keywords="healios supplements, natural vitamins collection, magnesium, ashwagandha, vitamin D, probiotics, science-backed supplements, premium wellness"
        url="https://healios.com/products"
        structuredData={productsStructuredData}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-16">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-4">
            Our Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Discover our complete range of premium supplements, each carefully formulated with science-backed ingredients to support your wellness journey.
          </p>
        </div>

        {/* Category Pills - Dynamically Generated from Database */}
        <div className="mb-6 sm:mb-8 flex justify-center px-2">
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center max-w-7xl">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {formatCategoryName(category)}
                {!isLoading && (
                  <span className="ml-0.5 sm:ml-1 opacity-60">
                    ({getCategoryCount(category)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Sort */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto px-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-gray-300 focus:border-gray-400 h-10 sm:h-auto"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px] border-gray-300 h-10 sm:h-auto">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 sm:h-96 animate-pulse" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <p className="text-gray-500 text-base sm:text-lg mb-6">No products found matching your criteria.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && sortedProducts.length > 0 && (
          <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
            Showing {sortedProducts.length} of {products?.length || 0} products
          </div>
        )}
      </div>
    </div>
  );
}
