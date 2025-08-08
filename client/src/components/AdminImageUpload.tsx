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
      console.log('[ADMIN_IMAGE_UPLOAD] Requesting upload URL...');
      const response = await apiRequest("POST", "/api/admin/images/upload-url");
      
      console.log('[ADMIN_IMAGE_UPLOAD] Response received:', response);
      
      // Parse the JSON response
      const data = await response.json();
      console.log('[ADMIN_IMAGE_UPLOAD] Parsed data:', data);
      
      if (!data.uploadURL) {
        console.error('[ADMIN_IMAGE_UPLOAD] No uploadURL in response:', data);
        throw new Error("No upload URL received");
      }

      console.log('[ADMIN_IMAGE_UPLOAD] Returning upload parameters with URL:', data.uploadURL);
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("[ADMIN_IMAGE_UPLOAD] Failed to get upload URL:", error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to prepare image upload. Please try again.",
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
      console.log('[ADMIN_IMAGE_UPLOAD] Uploaded file data:', uploadedFile);
      const uploadURL = uploadedFile.uploadURL || (uploadedFile as any).url;

      if (!uploadURL) {
        throw new Error("No upload URL in result");
      }

      // Confirm the upload with our backend
      console.log('[ADMIN_IMAGE_UPLOAD] Confirming upload with URL:', uploadURL);
      const confirmResponse = await apiRequest("POST", "/api/admin/images/confirm", { uploadURL });
      
      // Parse the JSON response
      const confirmData = await confirmResponse.json();
      console.log('[ADMIN_IMAGE_UPLOAD] Confirm parsed data:', confirmData);

      if (!confirmData.imageUrl) {
        console.error('[ADMIN_IMAGE_UPLOAD] No imageUrl in confirmation response:', confirmData);
        throw new Error("No image URL returned from confirmation");
      }

      console.log('[ADMIN_IMAGE_UPLOAD] Image uploaded successfully:', confirmData.imageUrl);
      onImageUploaded(confirmData.imageUrl);
      
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
        <div className="w-full h-[500px] border rounded overflow-hidden">
          <img 
            src={currentImageUrl} 
            alt="Current image" 
            className="w-full h-full object-cover"
          />
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