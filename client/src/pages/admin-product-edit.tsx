import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Package, DollarSign, Search, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import AdminImageUpload from "@/components/AdminImageUpload";
import { SEOHead } from '@/components/seo-head';

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
  // SEO fields
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
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
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
};

const availableCategories = [
  "Vitamins", "Minerals", "Gummies", "Probiotics", "Adaptogens", 
  "Beauty", "Prenatal", "Children", "Men's Health", "Women's Health", 
  "Mushrooms", "Energy", "Sleep", "Apparel"
];

export default function AdminProductEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [keywordInput, setKeywordInput] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = id !== "new";

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/admin/products/${id}`],
    enabled: isEditing,
  });

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || "",
        imageUrl: product.imageUrl,
        categories: product.categories || [],
        stockQuantity: product.stockQuantity?.toString() || "0",
        featured: product.featured || false,
        type: product.type || "supplement",
        bottleCount: product.bottleCount?.toString() || "",
        dailyDosage: product.dailyDosage?.toString() || "",
        supplyDays: product.supplyDays?.toString() || "",
        seoTitle: (product as any).seoTitle || "",
        seoDescription: (product as any).seoDescription || "",
        seoKeywords: (product as any).seoKeywords || [],
      });
    }
  }, [product, isEditing]);

  const updateProductMutation = useMutation({
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
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      };

      if (isEditing) {
        return apiRequest("PUT", `/api/admin/products/${id}`, payload);
      } else {
        return apiRequest("POST", "/api/admin/products", payload);
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/products/${id}`] });
      toast({ 
        title: "Success", 
        description: isEditing ? "Product updated successfully" : "Product created successfully" 
      });
      
      // Only redirect for new products, stay on edit page for updates
      if (!isEditing && data?.id) {
        setLocation(`/admin/products/${data.id}`);
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save product",
        variant: "destructive"
      });
    },
  });

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Validate required fields
    if (!formData.name.trim()) errors.push('Product name is required');
    if (!formData.description.trim()) errors.push('Product description is required');
    if (!formData.imageUrl.trim()) errors.push('Product image is required');
    if (formData.categories.length === 0) errors.push('At least one category must be selected');
    
    // Validate price - must be positive
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) errors.push('Price must be a positive number');
    
    // Validate stock quantity - must be non-negative
    const stockQuantity = parseInt(formData.stockQuantity);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      errors.push('Stock quantity must be a non-negative number');
    }
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors[0], // Show first error
        variant: 'destructive'
      });
      return;
    }
    
    updateProductMutation.mutate(formData);
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, keywordInput.trim()]
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(k => k !== keyword)
    }));
  };

  const generateSEOFromProduct = () => {
    if (formData.name && formData.description) {
      const title = formData.name;
      const description = formData.description.slice(0, 150) + (formData.description.length > 150 ? "..." : "");
      const keywords = [
        ...formData.categories.map(c => c.toLowerCase()),
        formData.type,
        "supplements",
        "health",
        "nutrition"
      ];
      
      setFormData(prev => ({
        ...prev,
        seoTitle: title,
        seoDescription: description,
        seoKeywords: [...prev.seoKeywords, ...keywords.filter(k => !prev.seoKeywords.includes(k))]
      }));
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <SEOHead 
        title={`${isEditing ? 'Edit' : 'Create'} Product - Admin | Healios`}
        description="Create and edit product details, pricing, inventory, and SEO settings in the Healios admin panel."
      />
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/admin")}
              className="border-gray-300 dark:border-gray-700 text-black dark:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                {isEditing ? "Edit Product" : "Create New Product"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing ? `Editing: ${product?.name}` : "Create a new product with full SEO optimization"}
              </p>
            </div>
          </div>
          <Button 
            form="product-form"
            type="submit"
            disabled={updateProductMutation.isPending}
            className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProductMutation.isPending ? "Saving..." : "Save Product"}
          </Button>
        </div>

        <form id="product-form" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="seo">SEO & AEO</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Package className="w-5 h-5" />
                    Product Information
                  </CardTitle>
                  <CardDescription>
                    Basic product details and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-black dark:text-white">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-black dark:text-white">Product Type *</Label>
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
                    <div className="space-y-4">
                      <AdminImageUpload
                        label="Product Image *"
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

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-black dark:text-white">Product Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      rows={6}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-black dark:text-white">Categories *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing & Stock Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <DollarSign className="w-5 h-5" />
                    Pricing & Inventory
                  </CardTitle>
                  <CardDescription>
                    Set prices and manage stock levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-black dark:text-white">Price (R) *</Label>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Supplement Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Package className="w-5 h-5" />
                    Product Details
                  </CardTitle>
                  <CardDescription>
                    Additional product specifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.type === 'supplement' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO & AEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Search className="w-5 h-5" />
                    SEO Optimization
                  </CardTitle>
                  <CardDescription>
                    Optimize your product for search engines and accessibility
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={generateSEOFromProduct}
                    className="border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Auto-generate SEO from product data
                  </Button>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seoTitle" className="text-black dark:text-white">SEO Title</Label>
                      <Input
                        id="seoTitle"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                        placeholder="Product Name"
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                      <p className="text-xs text-gray-500">Recommended length: 50-60 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoDescription" className="text-black dark:text-white">SEO Description</Label>
                      <Textarea
                        id="seoDescription"
                        value={formData.seoDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                        placeholder="Compelling description for search results..."
                        rows={3}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                      />
                      <p className="text-xs text-gray-500">Recommended length: 150-160 characters</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-black dark:text-white">SEO Keywords</Label>
                      <div className="flex gap-2">
                        <Input
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          placeholder="Enter keyword"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                        />
                        <Button type="button" onClick={handleAddKeyword} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.seoKeywords.map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer"
                            onClick={() => handleRemoveKeyword(keyword)}
                          >
                            {keyword} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
}