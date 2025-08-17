import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef({ setShowModal });
  const callbacksRef = useRef({ onGetUploadParameters, onComplete });
  
  // Update refs when props change
  useEffect(() => {
    modalRef.current.setShowModal = setShowModal;
    callbacksRef.current.onGetUploadParameters = onGetUploadParameters;
    callbacksRef.current.onComplete = onComplete;
  }, [onGetUploadParameters, onComplete]);
  
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    });
    
    uppyInstance.use(AwsS3, {
      shouldUseMultipart: false,
      getUploadParameters: async (file) => {
        
        try {
          const params = await callbacksRef.current.onGetUploadParameters();
          
          return params;
        } catch (error) {
          // // console.error('[OBJECT_UPLOADER] Failed to get upload parameters:', error);
          throw error;
        }
      },
    });
    
    uppyInstance.on("complete", (result) => {
      
      if (callbacksRef.current.onComplete) {
        callbacksRef.current.onComplete(result);
      }
      // Close modal after successful upload
      modalRef.current.setShowModal(false);
    });
    
    uppyInstance.on("error", (error) => {
      // // console.error('[OBJECT_UPLOADER] Upload error:', error);
    });
    
    return uppyInstance;
  });
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, [uppy]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setShowModal(true);
  };

  return (
    <div>
      <Button 
        type="button"
        onClick={handleButtonClick} 
        className={buttonClassName}
      >
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => {
          
          setShowModal(false);
        }}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}