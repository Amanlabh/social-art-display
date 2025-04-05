
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { saveImage } from "@/services/portfolioService";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  portfolioId?: string;
  userId?: string;
}

export default function ImageUploader({ onImagesUploaded, portfolioId, userId }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { startUpload, isUploading } = useUploadThing("imageUploader");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Create previews
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // Update files
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleRemovePreview = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      toast.info("Uploading images...");
      
      console.log("Starting upload with files:", files.length);
      console.log("Portfolio ID:", portfolioId);
      console.log("User ID:", userId);
      
      // Upload files using UploadThing (this is a mock function in development)
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          // In a real implementation this would use Supabase storage
          // For now, we'll use object URLs as placeholders
          return URL.createObjectURL(file);
        })
      );
      
      console.log("Generated image URLs:", imageUrls);
      
      // Save images to database with explicit properties
      const savedImages = await Promise.all(
        imageUrls.map(url => 
          saveImage({
            image_url: url,
            portfolio_id: portfolioId || null,
            user_id: userId || null
          })
        )
      );
      
      console.log("Saved images results:", savedImages);

      // Filter out null results and extract URLs
      const successfulUrls = savedImages
        .filter(Boolean)
        .map(image => image!.image_url);
      
      if (successfulUrls.length > 0) {
        onImagesUploaded(successfulUrls);
        toast.success(`${successfulUrls.length} images uploaded successfully!`);
        
        // Clear previews and files after successful upload
        previews.forEach(preview => URL.revokeObjectURL(preview));
        setFiles([]);
        setPreviews([]);
      } else {
        toast.error("Failed to save images to your portfolio");
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 my-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="object-cover w-24 h-24 rounded-md"
            />
            <button
              onClick={() => handleRemovePreview(index)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <Button 
          variant="outline" 
          className="border-2 border-dashed"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={uploading || isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Images
        </Button>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading || isUploading}
        />
        
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || uploading || isUploading}
        >
          {uploading || isUploading ? "Uploading..." : "Upload Images"}
        </Button>
      </div>
    </div>
  );
}
