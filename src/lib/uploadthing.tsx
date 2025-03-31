
import { createContext, useContext, ReactNode, useState } from "react";

// Mock UploadThing response structure
type UploadFileResponse = {
  url: string;
};

// Mock upload function
const mockUpload = async (files: File[]): Promise<UploadFileResponse[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create URLs for the uploaded files
  return files.map(file => ({
    url: URL.createObjectURL(file)
  }));
};

// Mock hook for uploading files
export const useUploadThing = (endpoint: string) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const startUpload = async (files: File[]): Promise<UploadFileResponse[]> => {
    setIsUploading(true);
    try {
      const response = await mockUpload(files);
      return response;
    } finally {
      setIsUploading(false);
    }
  };
  
  return { startUpload, isUploading };
};

// Mock function for uploading files directly
export const uploadFiles = async (files: File[]): Promise<UploadFileResponse[]> => {
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
