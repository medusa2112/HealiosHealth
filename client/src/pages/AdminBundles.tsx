import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Package, DollarSign, Calendar, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

interface Bundle {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  type: 'fixed' | 'percentage';
  discountValue: string;
  isActive: boolean;
  maxQuantity: number | null;
  expiresAt: string | null;
  imageUrl: string | null;
  createdAt: string;
}

const bundleSchema = z.object({
  id: z.string().min(1, 'Bundle ID is required'),
  name: z.string().min(1, 'Bundle name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  originalPrice: z.string().optional(),
  type: z.enum(['fixed', 'percentage']),
  discountValue: z.string().min(1, 'Discount value is required'),
  isActive: z.boolean(),
  maxQuantity: z.number().optional(),
  expiresAt: z.string().optional(),
  imageUrl: z.string().optional(),
});

type BundleFormData = z.infer<typeof bundleSchema>;

export default function AdminBundles() {
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<BundleFormData>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      type: 'percentage',
      discountValue: '',
      isActive: true,
      maxQuantity: undefined,
      expiresAt: '',
      imageUrl: '',
    },
  });

  // Fetch bundles
  const { data: bundles, isLoading } = useQuery({
    queryKey: ['/api/admin/bundles'],
    queryFn: async () => {
      const response = await fetch('/api/admin/bundles', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch bundles');
      return response.json() as Promise<Bundle[]>;
    },
  });

  // Create bundle mutation
  const createBundleMutation = useMutation({
    mutationFn: (data: BundleFormData) => 
      apiRequest('POST', '/api/admin/bundles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bundles'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ description: 'Bundle created successfully!' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        description: error.message || 'Failed to create bundle',
      });
    },
  });

  // Update bundle mutation
  const updateBundleMutation = useMutation({
    mutationFn: ({ id, ...data }: BundleFormData) => 
      apiRequest('PUT', `/api/admin/bundles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bundles'] });
      setIsEditDialogOpen(false);
      setSelectedBundle(null);
      form.reset();
      toast({ description: 'Bundle updated successfully!' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        description: error.message || 'Failed to update bundle',
      });
    },
  });

  // Delete bundle mutation
  const deleteBundleMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest('DELETE', `/api/admin/bundles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bundles'] });
      toast({ description: 'Bundle deleted successfully!' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        description: error.message || 'Failed to delete bundle',
      });
    },
  });

  const handleCreate = (data: BundleFormData) => {
    createBundleMutation.mutate(data);
  };

  const handleUpdate = (data: BundleFormData) => {
    updateBundleMutation.mutate(data);
  };

  const handleEdit = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    form.reset({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      price: bundle.price,
      originalPrice: bundle.originalPrice || '',
      type: bundle.type,
      discountValue: bundle.discountValue,
      isActive: bundle.isActive,
      maxQuantity: bundle.maxQuantity || undefined,
      expiresAt: bundle.expiresAt || '',
      imageUrl: bundle.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bundle?')) {
      deleteBundleMutation.mutate(id);
    }
  };

  const calculateDiscountPercent = (price: string, originalPrice: string) => {
    const current = parseFloat(price);
    const original = parseFloat(originalPrice);
    if (original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  const BundleForm = ({ onSubmit, isPending }: { onSubmit: (data: BundleFormData) => void; isPending: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bundle ID</FormLabel>
                <FormControl>
                  <Input placeholder="wellness-starter-pack" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bundle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Wellness Starter Pack" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Perfect for beginning your health journey..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bundle Price (R)</FormLabel>
                <FormControl>
                  <Input placeholder="799.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price (R)</FormLabel>
                <FormControl>
                  <Input placeholder="1127.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={form.watch('type') === 'percentage' ? '20' : '349.00'} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Quantity (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="50" 
                    value={field.value || ''} 
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date (optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="/assets/bundle-image.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-medium">Active Bundle</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              form.reset();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : selectedBundle ? 'Update Bundle' : 'Create Bundle'}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Product Bundles</h1>
          <p className="text-gray-600 mt-2">Manage product bundles with smart pricing and exclusion rules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bundle</DialogTitle>
            </DialogHeader>
            <BundleForm 
              onSubmit={handleCreate} 
              isPending={createBundleMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles?.map((bundle) => {
          const discountPercent = bundle.originalPrice ? 
            calculateDiscountPercent(bundle.price, bundle.originalPrice) : 0;

          return (
            <Card key={bundle.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{bundle.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      ID: {bundle.id}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant={bundle.isActive ? 'default' : 'secondary'}>
                      {bundle.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {bundle.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-lg">R{bundle.price}</span>
                    </div>
                    {bundle.originalPrice && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">
                          R{bundle.originalPrice}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {discountPercent}% off
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <span>{bundle.type === 'percentage' ? `${bundle.discountValue}% off` : `R${bundle.discountValue} discount`}</span>
                    </div>
                    {bundle.maxQuantity && (
                      <div className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>Max: {bundle.maxQuantity}</span>
                      </div>
                    )}
                  </div>

                  {bundle.expiresAt && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {new Date(bundle.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(bundle)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(bundle.id)}
                    disabled={deleteBundleMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bundles?.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles created yet</h3>
          <p className="text-gray-600 mb-4">Create your first product bundle to get started.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Bundle
          </Button>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bundle</DialogTitle>
          </DialogHeader>
          <BundleForm 
            onSubmit={handleUpdate} 
            isPending={updateBundleMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}