import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Package, DollarSign, Eye, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import AdminImageUpload from "@/components/AdminImageUpload";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  categories: string[];
  stockQuantity: string;
  featured: boolean;
  type: string;
  bottleCount: string;
  dailyDosage: string;
  supplyDays: string;
}

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  imageUrl: "",
  categories: [],
  stockQuantity: "0",
  featured: false,
  type: "supplement",
  bottleCount: "",
  dailyDosage: "",
  supplyDays: "",
};

const availableCategories = [
  "Vitamins", "Minerals", "Gummies", "Probiotics", "Adaptogens", 
  "Beauty", "Prenatal", "Children", "Men's Health", "Women's Health"
];

export default function AdminProducts() {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/admin/products"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        imageUrl: data.imageUrl,
        categories: data.categories,
        stockQuantity: parseInt(data.stockQuantity) || 0,
        featured: data.featured,
        type: data.type,
        bottleCount: data.bottleCount ? parseInt(data.bottleCount) : null,
        dailyDosage: data.dailyDosage ? parseInt(data.dailyDosage) : null,
        supplyDays: data.supplyDays ? parseInt(data.supplyDays) : null,
      };

      return apiRequest("/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/admin"] });
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      toast({ title: "Success", description: "Product created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        imageUrl: data.imageUrl,
        categories: data.categories,
        stockQuantity: parseInt(data.stockQuantity) || 0,
        featured: data.featured,
        type: data.type,
        bottleCount: data.bottleCount ? parseInt(data.bottleCount) : null,
        dailyDosage: data.dailyDosage ? parseInt(data.dailyDosage) : null,
        supplyDays: data.supplyDays ? parseInt(data.supplyDays) : null,
      };

      return apiRequest(`/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/admin"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(defaultFormData);
      toast({ title: "Success", description: "Product updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update product",
        variant: "destructive"
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/admin/products/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/admin"] });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || "",
      imageUrl: product.imageUrl,
      categories: product.categories,
      stockQuantity: product.stockQuantity?.toString() || "0",
      featured: product.featured,
      type: product.type || "supplement",
      bottleCount: product.bottleCount?.toString() || "",
      dailyDosage: product.dailyDosage?.toString() || "",
      supplyDays: product.supplyDays?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || 
                           product.categories?.includes(filterCategory);
    return matchesSearch && matchesCategory;
  }) || [];

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingProduct(null);
  };

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
              Manage your product catalog with full CRUD operations
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle className="text-black dark:text-white">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update product information" : "Fill in the details to create a new product"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-black dark:text-white">Basic Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-black dark:text-white">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-black dark:text-white">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={3}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <AdminImageUpload
                        label="Product Image"
                        currentImageUrl={formData.imageUrl}
                        onImageUploaded={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl }))}
                      />
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-black dark:text-white text-xs">Or paste image URL</Label>
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Stock */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-black dark:text-white">Pricing & Stock</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-black dark:text-white">Price (R)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          required
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice" className="text-black dark:text-white">Original Price (R)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity" className="text-black dark:text-white">Stock Quantity</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-black dark:text-white">Product Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          <SelectItem value="supplement">Supplement</SelectItem>
                          <SelectItem value="apparel">Apparel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label className="text-black dark:text-white">Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={formData.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={category} className="text-sm text-black dark:text-white">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplement Details */}
                {formData.type === 'supplement' && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-black dark:text-white">Supplement Details</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bottleCount" className="text-black dark:text-white">Bottle Count</Label>
                        <Input
                          id="bottleCount"
                          type="number"
                          value={formData.bottleCount}
                          onChange={(e) => setFormData(prev => ({ ...prev, bottleCount: e.target.value }))}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dailyDosage" className="text-black dark:text-white">Daily Dosage</Label>
                        <Input
                          id="dailyDosage"
                          type="number"
                          value={formData.dailyDosage}
                          onChange={(e) => setFormData(prev => ({ ...prev, dailyDosage: e.target.value }))}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplyDays" className="text-black dark:text-white">Supply Days</Label>
                        <Input
                          id="supplyDays"
                          type="number"
                          value={formData.supplyDays}
                          onChange={(e) => setFormData(prev => ({ ...prev, supplyDays: e.target.value }))}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: Boolean(checked) }))}
                  />
                  <Label htmlFor="featured" className="text-black dark:text-white">
                    Featured Product
                  </Label>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending
                      ? "Saving..."
                      : editingProduct
                      ? "Update Product"
                      : "Create Product"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
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
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded mb-4 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.png';
                    }}
                  />
                </div>
                <CardTitle className="text-sm font-medium text-black dark:text-white line-clamp-2">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-black dark:text-white">
                    R{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      R{product.originalPrice}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Package className="w-4 h-4" />
                    <span>Stock: {product.stockQuantity}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {product.categories?.slice(0, 2).map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {product.featured && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex-1 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product)}
                    disabled={deleteProductMutation.isPending}
                    className="border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filterCategory !== "all" 
                ? "Try adjusting your search or filters"
                : "Create your first product to get started"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}