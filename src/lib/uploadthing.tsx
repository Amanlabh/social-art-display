
import { createContext, useContext, ReactNode, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock UploadThing response structure
type UploadFileResponse = {
  url: string;
};

// Mock upload function that uses Supabase storage
const mockUpload = async (files: File[]): Promise<UploadFileResponse[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const responses: UploadFileResponse[] = [];
  
  for (const file of files) {
    try {
      // In a real implementation with Supabase storage, we would do:
      // const { data, error } = await supabase.storage
      //   .from('images')
      //   .upload(`${Date.now()}-${file.name}`, file);
      // 
      // if (error) throw error;
      // const url = supabase.storage.from('images').getPublicUrl(data.path).data.publicUrl;

      // For development, use object URLs
      console.log(`Mocking upload of file: ${file.name} (${file.size} bytes)`);
      const url = URL.createObjectURL(file);
      console.log(`Generated URL: ${url}`);
      responses.push({ url });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
    }
  }
  
  return responses;
};

// Mock hook for uploading files
export const useUploadThing = (endpoint: string) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const startUpload = async (files: File[]): Promise<UploadFileResponse[]> => {
    setIsUploading(true);
    console.log(`Starting upload of ${files.length} files to endpoint: ${endpoint}`);
    
    try {
      const response = await mockUpload(files);
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

// Mock function for uploading files directly
export const uploadFiles = async (files: File[]): Promise<UploadFileResponse[]> => {
  console.log(`Uploading ${files.length} files directly`);
  return await mockUpload(files);
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
