
import { createContext, useContext, ReactNode, useState } from "react";
import { toast } from "sonner";

// Type for upload file response
type UploadFileResponse = {
  url: string;
};

// Direct file upload function using fetch to an image hosting service
// We're using a free service that allows direct image uploads
const uploadToImageService = async (files: File[]): Promise<UploadFileResponse[]> => {
  const responses: UploadFileResponse[] = [];
  
  for (const file of files) {
    try {
      console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
      
      // Using ImgBB as a simple image hosting service
      const formData = new FormData();
      formData.append('image', file);
      // Note: In production, you'd use your own API key or a more robust service
      formData.append('key', '6d207e02198a847aa98d0a2a901485a2'); // This is a free demo key, not recommended for production
      
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload image");
      }
      
      const url = data.data.url;
      console.log(`File uploaded successfully. URL: ${url}`);
      responses.push({ url });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
    }
  }
  
  return responses;
};

// Hook for uploading files
export const useUploadThing = (endpoint: string) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const startUpload = async (files: File[]): Promise<UploadFileResponse[]> => {
    setIsUploading(true);
    console.log(`Starting upload of ${files.length} files to endpoint: ${endpoint}`);
    
    try {
      const response = await uploadToImageService(files);
      console.log("Upload complete, responses:", response);
      return response;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  return { startUpload, isUploading };
};

// Direct upload function
export const uploadFiles = async (files: File[]): Promise<UploadFileResponse[]> => {
  console.log(`Uploading ${files.length} files directly`);
  return await uploadToImageService(files);
};

// Context for UploadThing provider
const UploadThingContext = createContext<null>(null);

export function UploadThingProvider({ children }: { children: ReactNode }) {
  return (
    <UploadThingContext.Provider value={null}>
      {children}
    </UploadThingContext.Provider>
  );
}

export function useUploadThingContext() {
  const context = useContext(UploadThingContext);
  if (context === undefined) {
    throw new Error("useUploadThingContext must be used within a UploadThingProvider");
  }
  return context;
}
