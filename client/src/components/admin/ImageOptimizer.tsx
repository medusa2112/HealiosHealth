import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Zap, Info } from 'lucide-react';

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  outputPath: string;
}

export function ImageOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [quality, setQuality] = useState('80');
  const [format, setFormat] = useState('webp');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleOptimize = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image file to optimize.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', quality);
    formData.append('format', format);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);

    try {
      const response = await fetch('/api/admin/images/optimize/optimize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast({
          title: "Image optimized successfully!",
          description: `Saved ${data.savings.toFixed(1)}% of file size`,
        });
      } else {
        throw new Error(data.error || 'Optimization failed');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization failed",
        description: "Failed to optimize the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimizeAssets = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/admin/images/optimize/optimize-assets', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Assets optimized successfully!",
          description: `Processed ${data.processed} images with ${data.totalSavings.toFixed(1)}% total savings`,
        });
      } else {
        throw new Error(data.error || 'Asset optimization failed');
      }
    } catch (error) {
      console.error('Asset optimization error:', error);
      toast({
        title: "Asset optimization failed",
        description: "Failed to optimize existing assets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Image Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Select Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          {/* Optimization Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality">Quality (%)</Label>
              <Input
                id="quality"
                type="number"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP (Recommended)</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                placeholder="Auto"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Auto"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleOptimize} 
              disabled={!file || isOptimizing}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isOptimizing ? 'Optimizing...' : 'Optimize Image'}
            </Button>

            <Button 
              variant="outline"
              onClick={handleOptimizeAssets}
              disabled={isOptimizing}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Optimize All Assets
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-800">Optimization Complete</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Original Size</p>
                    <p className="font-semibold">{formatFileSize(result.originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Optimized Size</p>
                    <p className="font-semibold">{formatFileSize(result.optimizedSize)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Savings</p>
                    <p className="font-semibold text-green-600">{result.savings.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Output Path</p>
                    <p className="font-mono text-xs break-all">{result.outputPath}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• WebP format provides the best compression with minimal quality loss</li>
            <li>• Use 70-85% quality for most images (80% is recommended)</li>
            <li>• Resize large images to appropriate dimensions for web use</li>
            <li>• Optimize all assets regularly to maintain fast loading times</li>
            <li>• Consider using responsive images for different screen sizes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}