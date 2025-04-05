
import { createContext, useContext, ReactNode, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type for upload file response
type UploadFileResponse = {
  url: string;
};

// Real upload function using Supabase storage
const uploadToSupabase = async (files: File[]): Promise<UploadFileResponse[]> => {
  const responses: UploadFileResponse[] = [];
  
  for (const file of files) {
    try {
      console.log(`Uploading file to Supabase: ${file.name} (${file.size} bytes)`);
      
      // Generate a unique filename to avoid collisions
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(uniqueFileName, file);
      
      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(uniqueFileName);
      
      const url = urlData.publicUrl;
      console.log(`File uploaded successfully. Public URL: ${url}`);
      responses.push({ url });
    } catch (error) {
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
      const response = await uploadToSupabase(files);
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
  return await uploadToSupabase(files);
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
