
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfilePictureUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (url: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ProfilePictureUploader({ 
  initialImageUrl, 
  onImageUploaded,
  size = "lg" 
}: ProfilePictureUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  
  const { startUpload } = useUploadThing("imageUploader");

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40"
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      try {
        setIsUploading(true);
        toast.info("Uploading profile picture...");
        
        const response = await startUpload([file]);
        
        if (response && response.length > 0) {
          const url = response[0].url;
          setImageUrl(url);
          onImageUploaded(url);
          toast.success("Profile picture uploaded successfully!");
        }
        
      } catch (error) {
        toast.error("Failed to upload profile picture");
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = () => {
    setImageUrl(undefined);
    onImageUploaded("");
    toast.success("Profile picture removed");
  };

  const getInitials = () => {
    return "A";  // Default fallback - in a real app, get from user's name
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("relative group", sizeClasses[size])}>
        <Avatar className={cn("border-4 border-white shadow-lg", sizeClasses[size])}>
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white text-2xl">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        
        {imageUrl && (
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={isUploading}
          >
            <X size={16} />
          </button>
        )}
        
        <div 
          onClick={() => document.getElementById('profile-picture-upload')?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
          aria-hidden="true"
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <input
        id="profile-picture-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => document.getElementById('profile-picture-upload')?.click()}
        disabled={isUploading}
        className="mt-2"
      >
        {imageUrl ? "Change Picture" : "Upload Picture"}
      </Button>
    </div>
  );
}
