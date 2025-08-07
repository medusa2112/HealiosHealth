import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

const availableCategories = [
  "Vitamins", "Minerals", "Gummies", "Probiotics", "Adaptogens", 
  "Beauty", "Prenatal", "Children", "Men's Health", "Women's Health", 
  "Mushrooms", "Energy", "Sleep", "Apparel"
];

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

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
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Product Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your product catalog - {filteredProducts.length} of {products?.length || 0} products
            </p>
          </div>
          <Button 
            onClick={handleCreateNew}
            className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="supplement">Supplements</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Products ({filteredProducts.length})
            </CardTitle>
            <CardDescription>
              Click on any product to edit its details, pricing, and SEO settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {products?.length === 0 ? "No products found. Create your first product!" : "No products match your search criteria."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="text-black dark:text-white">Product</TableHead>
                      <TableHead className="text-black dark:text-white">Type</TableHead>
                      <TableHead className="text-black dark:text-white">Categories</TableHead>
                      <TableHead className="text-black dark:text-white">Price</TableHead>
                      <TableHead className="text-black dark:text-white">Stock</TableHead>
                      <TableHead className="text-black dark:text-white">Status</TableHead>
                      <TableHead className="text-black dark:text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                        onClick={() => handleEdit(product.id)}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-black dark:text-white truncate">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {product.description.length > 60 
                                  ? product.description.substring(0, 60) + "..."
                                  : product.description
                                }
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.type || 'supplement'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-48">
                            {product.categories?.slice(0, 2).map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {(product.categories?.length || 0) > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(product.categories?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-black dark:text-white">
                            <div className="font-medium">R{product.price}</div>
                            {product.originalPrice && (
                              <div className="text-sm text-gray-500 line-through">
                                R{product.originalPrice}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className={`${
                              (product.stockQuantity || 0) > 10 
                                ? 'text-green-600 dark:text-green-400' 
                                : (product.stockQuantity || 0) > 0 
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {product.stockQuantity || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.featured && (
                              <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Featured
                              </Badge>
                            )}
                            <Badge 
                              variant={product.inStock ? "default" : "destructive"} 
                              className="text-xs"
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(product.id);
                              }}
                              className="border-gray-300 dark:border-gray-700 text-black dark:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(product);
                              }}
                              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                              disabled={deleteProductMutation.isPending}
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