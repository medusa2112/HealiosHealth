import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Package, DollarSign, Eye, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from '@/components/seo-head';

const availableCategories = [
  "Vitamins", "Minerals", "Gummies", "Probiotics", "Adaptogens", 
  "Beauty", "Prenatal", "Children", "Men's Health", "Women's Health", 
  "Mushrooms", "Energy", "Sleep", "Apparel"
];

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  // Persistent filters using localStorage
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('admin-products-search') || "";
  });
  const [filterCategory, setFilterCategory] = useState(() => {
    return localStorage.getItem('admin-products-category') || "all";
  });
  const [filterType, setFilterType] = useState(() => {
    return localStorage.getItem('admin-products-type') || "all";
  });
  
  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admin-products-search', searchTerm);
  }, [searchTerm]);
  
  useEffect(() => {
    localStorage.setItem('admin-products-category', filterCategory);
  }, [filterCategory]);
  
  useEffect(() => {
    localStorage.setItem('admin-products-type', filterType);
  }, [filterType]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Support for paginated product loading with performance handling
  const { data: productData, isLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    select: (data: any) => {
      // Handle both old format (array) and new format (object with pagination)
      if (Array.isArray(data)) {
        return {
          products: data,
          pagination: { total: data.length, limit: 1000, offset: 0, hasMore: false },
          performanceWarning: data.length > 500 ? 'Large dataset detected' : null
        };
      }
      return data;
    }
  });
  
  const products = (productData?.products || []) as Product[];
  const performanceWarning = productData?.performanceWarning;

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      toast({ title: "Success", description: "Product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    },
  });

  const handleEdit = (productId: string) => {
    setLocation(`/admin/products/${productId}`);
  };

  const handleCreateNew = () => {
    setLocation("/admin/products/new");
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || 
                           product.categories?.includes(filterCategory);
    const matchesType = filterType === "all" || product.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <SEOHead 
        title="Product Management - Admin | Healios"
        description="Manage products, inventory, and product details in the Healios admin panel."
      />
      <div className="w-screen" style={{ paddingLeft: '5vw', paddingRight: '5vw', marginLeft: 'calc(-50vw + 50%)', width: '100vw' }}>
        {/* Compact Header with Filters and Actions */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      {availableCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-36 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="supplement">Supplements</SelectItem>
                      <SelectItem value="apparel">Apparel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                    {filteredProducts.length} products
                    {performanceWarning && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">⚠️ {performanceWarning}</div>
                    )}
                  </div>
                  <Button 
                    onClick={handleCreateNew}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 flex-1 sm:flex-initial"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid/Table */}
        <Card>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  {products?.length === 0 ? "No products found" : "No products match your filters"}
                </div>
                <div className="text-sm">
                  {products?.length === 0 ? "Create your first product to get started!" : "Try adjusting your search or filter criteria."}
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="w-full min-w-[1200px]">
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <TableHead className="text-black dark:text-white font-semibold py-6 px-6 w-[35%]">Product</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold py-6 px-4 w-[8%]">Type</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold py-6 px-4 w-[18%]">Categories</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold py-6 px-4 w-[10%]">Price</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold py-6 px-4 text-center w-[8%]">Stock</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold py-6 px-4 w-[11%]">Status</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold py-6 px-4 text-center w-[10%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-all duration-200 border-b-2"
                        onClick={() => handleEdit(product.id)}
                      >
                        <TableCell className="py-6 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="font-semibold text-black dark:text-white text-sm leading-tight">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {product.description.length > 80 
                                  ? product.description.substring(0, 80) + "..."
                                  : product.description
                                }
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <Badge variant="outline" className="capitalize text-xs px-2 py-1">
                            {product.type === 'supplement' ? 'Supp' : product.type || 'Supp'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {product.categories?.slice(0, 2).map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs px-2 py-1">
                                {category.length > 10 ? category.substring(0, 10) + '...' : category}
                              </Badge>
                            ))}
                            {(product.categories?.length || 0) > 2 && (
                              <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700">
                                +{(product.categories?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div className="text-black dark:text-white space-y-1">
                            <div className="font-semibold text-sm">R{product.price}</div>
                            {product.originalPrice && (
                              <div className="text-xs text-gray-500 line-through">
                                R{product.originalPrice}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-6 px-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            (product.stockQuantity || 0) > 10 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : (product.stockQuantity || 0) > 0 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <Package className="w-3 h-3" />
                            {product.stockQuantity || 0}
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div className="flex flex-col gap-2">
                            {product.featured && (
                              <Badge className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 w-fit">
                                Featured
                              </Badge>
                            )}
                            <Badge 
                              variant={product.inStock ? "default" : "destructive"} 
                              className="text-xs px-2 py-1 w-fit"
                            >
                              {product.inStock ? "In Stock" : "Out"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(product.id);
                              }}
                              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(product);
                              }}
                              className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg"
                              disabled={deleteProductMutation.isPending}
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}