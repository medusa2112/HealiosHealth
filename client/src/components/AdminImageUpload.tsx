import { useState } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, ExternalLink } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface AdminImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function AdminImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  label = "Product Image" 
}: AdminImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("/api/admin/images/upload-url", {
        method: "POST",
      });
      
      if (!response.uploadURL) {
        throw new Error("No upload URL received");
      }

      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      toast({
        title: "Upload Error",
        description: "Failed to prepare image upload. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      setIsUploading(true);
      
      if (!result.successful || result.successful.length === 0) {
        throw new Error("Upload failed");
      }

      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;

      if (!uploadURL) {
        throw new Error("No upload URL in result");
      }

      // Confirm the upload with our backend
      const confirmResponse = await apiRequest("/api/admin/images/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadURL }),
      });

      if (!confirmResponse.imageUrl) {
        throw new Error("No image URL returned from confirmation");
      }

      onImageUploaded(confirmResponse.imageUrl);
      
      toast({
        title: "Upload Successful",
        description: "Image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload completion failed:", error);
      toast({
        title: "Upload Error",
        description: "Failed to complete image upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {currentImageUrl && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <img 
            src={currentImageUrl} 
            alt="Current image" 
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Current image</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentImageUrl, '_blank')}
              className="mt-1"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Full Size
            </Button>
          </div>
        </div>
      )}

      <ObjectUploader
        maxNumberOfFiles={1}
        maxFileSize={10485760} // 10MB
        onGetUploadParameters={handleGetUploadParameters}
        onComplete={handleUploadComplete}
        buttonClassName="w-full"
      >
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {isUploading ? "Processing..." : currentImageUrl ? "Replace Image" : "Upload Image"}
        </div>
      </ObjectUploader>

      {isUploading && (
        <p className="text-sm text-gray-500">
          Uploading image to secure storage...
        </p>
      )}
    </div>
  );
}