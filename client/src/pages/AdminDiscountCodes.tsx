import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, TrendingUp, Users, Percent } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { DiscountCode, InsertDiscountCode } from '@shared/schema';
import { SEOHead } from '@/components/seo-head';
import { AdminNavbar } from '@/components/admin-navbar';
import { useLocation } from "wouter";

interface CreateDiscountForm {
  code: string;
  type: 'percent' | 'fixed';
  value: string;
  usageLimit: string;
  expiresAt: string;
  isActive: boolean;
}

const initialFormState: CreateDiscountForm = {
  code: '',
  type: 'percent',
  value: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

function AdminDiscountCodes() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState<CreateDiscountForm>(initialFormState);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ['/api/admin/discount-codes'],
    queryFn: () => fetch('/api/admin/discount-codes').then(res => res.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertDiscountCode) => 
      apiRequest('POST', '/api/admin/discount-codes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      setIsCreateDialogOpen(false);
      setForm(initialFormState);
      toast({ description: "Discount code created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        description: error.message || "Failed to create discount code", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DiscountCode> }) =>
      apiRequest('PUT', `/api/admin/discount-codes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      setEditingCode(null);
      setForm(initialFormState);
      toast({ description: "Discount code updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        description: error.message || "Failed to update discount code", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest('DELETE', `/api/admin/discount-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({ description: "Discount code deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        description: error.message || "Failed to delete discount code", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.code.trim() || !form.value.trim()) {
      toast({ description: "Code and value are required", variant: "destructive" });
      return;
    }

    const discountData: InsertDiscountCode = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: form.value,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data: discountData });
    } else {
      createMutation.mutate(discountData);
    }
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setForm({
      code: code.code,
      type: code.type as 'percent' | 'fixed',
      value: code.value,
      usageLimit: code.usageLimit?.toString() || '',
      expiresAt: code.expiresAt ? format(new Date(code.expiresAt), 'yyyy-MM-dd') : '',
      isActive: code.isActive ?? true,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this discount code?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingCode(null);
  };

  const getStatusBadge = (code: DiscountCode) => {
    if (!code.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    const now = new Date();
    if (code.expiresAt && new Date(code.expiresAt) < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (code.usageLimit && (code.usageCount ?? 0) >= code.usageLimit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const getDiscountDisplay = (code: DiscountCode) => {
    return code.type === 'percent' 
      ? `${code.value}% off` 
      : `R${parseFloat(code.value).toFixed(2)} off`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  const activeCodesCount = discountCodes.filter((c: DiscountCode) => c.isActive).length;
  const totalUsage = discountCodes.reduce((sum: number, c: DiscountCode) => sum + ((c.usageCount ?? 0)), 0);

  const handleTabChange = (tab: string) => {
    // Navigation handled by the AdminNavbar component
    if (tab !== "discounts") {
      setLocation(`/admin`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdminNavbar activeTab="discounts" onTabChange={handleTabChange} />
      <SEOHead 
        title="Discount Codes - Admin | Healios"
        description="Manage promotional codes and discounts in the Healios admin panel."
      />
      <div className="max-w-7xl mx-auto px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discount Codes</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage promotional codes and discounts for your store
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discountCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCodesCount} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              All time redemptions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discountCodes.length > 0 ? Math.round(totalUsage / discountCodes.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per discount code
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Discount Codes</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCode ? 'Edit Discount Code' : 'Create New Discount Code'}
                </DialogTitle>
                <DialogDescription>
                  {editingCode ? 'Update the discount code details below.' : 'Create a new discount code for your customers.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WELCOME10"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select value={form.type} onValueChange={(value: 'percent' | 'fixed') => setForm({ ...form, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (R)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="value">
                    {form.type === 'percent' ? 'Percentage (%)' : 'Amount (R)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    max={form.type === 'percent' ? '100' : undefined}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === 'percent' ? '10' : '50.00'}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="Unlimited if empty"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="expiresAt">Expiry Date (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCode ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discount Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Codes</CardTitle>
          <CardDescription>
            Manage all your promotional discount codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.map((code: DiscountCode) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-medium">
                    {code.code}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {code.type === 'percent' ? 'Percentage' : 'Fixed Amount'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDiscountDisplay(code)}</TableCell>
                  <TableCell>
                    {code.usageCount || 0}
                    {code.usageLimit && ` / ${code.usageLimit}`}
                  </TableCell>
                  <TableCell>
                    {code.expiresAt ? format(new Date(code.expiresAt), 'MMM dd, yyyy') : 'Never'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(code)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(code)}
                        disabled={updateMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(code.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {discountCodes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No discount codes found. Create your first discount code to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default AdminDiscountCodes;