
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
}

export default function ImageUploader({ onImagesUploaded }: ImageUploaderProps) {
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
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      toast.info("Uploading images...");
      
      const response = await startUpload(files);
      
      if (response && response.length > 0) {
        const imageUrls = response.map(r => r.fileUrl);
        onImagesUploaded(imageUrls);
        toast.success("Images uploaded successfully!");
        setFiles([]);
        setPreviews([]);
      }
      
    } catch (error) {
      toast.error("Failed to upload images. Please try again.");
      console.error("Upload error:", error);
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
      
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="border-dashed border-2"
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
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {uploading || isUploading ? "Uploading..." : "Upload Images"}
        </Button>
      </div>
    </div>
  );
}
