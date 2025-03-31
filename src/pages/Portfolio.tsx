
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Globe, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  name: string;
  bio: string;
  website: string;
  instagram: string;
  twitter: string;
}

interface ArtworkImage {
  id: string;
  url: string;
  source: "upload" | "instagram" | "twitter";
}

const Portfolio = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    bio: "",
    website: "",
    instagram: "",
    twitter: ""
  });
  const [images, setImages] = useState<ArtworkImage[]>([]);

  useEffect(() => {
    // In a real app, we would fetch this data from an API using the portfolio ID
    // For this mock, we'll load from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    const savedImages = localStorage.getItem("userImages");
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-purple-900">
              {profile.name || "Artist Portfolio"}
            </h1>
            
            {profile.bio && (
              <p className="text-xl mb-6 text-gray-600 max-w-2xl mx-auto">
                {profile.bio}
              </p>
            )}
            
            <div className="flex justify-center gap-4">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                   className="text-gray-600 hover:text-purple-600">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              <a href="#" className="text-gray-600 hover:text-purple-600">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map(image => (
                <div key={image.id} className="group">
                  <div className="relative overflow-hidden rounded-lg shadow-sm">
                    <img 
                      src={image.url} 
                      alt="Artwork" 
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-black/60 text-white text-xs uppercase rounded">
                          {image.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-gray-500">No artwork to display yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
