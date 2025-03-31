
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

interface SocialConnection {
  platform: "instagram" | "twitter";
  connected: boolean;
  username: string;
  accessToken: string;
  lastFetched?: Date;
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
  const [socialConnections, setSocialConnections] = useState<{
    instagram: SocialConnection;
    twitter: SocialConnection;
  }>({
    instagram: { platform: "instagram", connected: false, username: "", accessToken: "" },
    twitter: { platform: "twitter", connected: false, username: "", accessToken: "" }
  });

  useEffect(() => {
    // In a real app, we would fetch this data from an API using the portfolio ID
    // For this mock, we'll load from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    const savedImages = localStorage.getItem("userImages");
    const savedConnections = localStorage.getItem("socialConnections");
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
    
    if (savedConnections) {
      setSocialConnections(JSON.parse(savedConnections));
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
              {socialConnections.instagram.connected && (
                <a 
                  href={`https://instagram.com/${profile.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialConnections.twitter.connected && (
                <a 
                  href={`https://twitter.com/${profile.twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          
          {images.length > 0 ? (
            <div>
              {/* Uploaded Images */}
              {images.some(img => img.source === "upload") && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-purple-800">My Artwork</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images
                      .filter(image => image.source === "upload")
                      .map(image => (
                        <div key={image.id} className="group">
                          <div className="relative overflow-hidden rounded-lg shadow-sm">
                            <img 
                              src={image.url} 
                              alt="Artwork" 
                              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Instagram Images */}
              {images.some(img => img.source === "instagram") && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-pink-600 flex items-center gap-2">
                    <Instagram className="w-6 h-6" />
                    Instagram
                    {profile.instagram && <span className="text-lg font-normal text-gray-500">@{profile.instagram}</span>}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images
                      .filter(image => image.source === "instagram")
                      .map(image => (
                        <div key={image.id} className="group">
                          <div className="relative overflow-hidden rounded-lg shadow-sm">
                            <img 
                              src={image.url} 
                              alt="Instagram post" 
                              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <div className="flex items-center text-white">
                                <Instagram className="w-4 h-4 mr-1" />
                                <span className="text-sm">Instagram</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Twitter Images */}
              {images.some(img => img.source === "twitter") && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-blue-500 flex items-center gap-2">
                    <Twitter className="w-6 h-6" />
                    Twitter
                    {profile.twitter && <span className="text-lg font-normal text-gray-500">@{profile.twitter}</span>}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images
                      .filter(image => image.source === "twitter")
                      .map(image => (
                        <div key={image.id} className="group">
                          <div className="relative overflow-hidden rounded-lg shadow-sm">
                            <img 
                              src={image.url} 
                              alt="Twitter post" 
                              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                              <div className="flex items-center text-white">
                                <Twitter className="w-4 h-4 mr-1" />
                                <span className="text-sm">Twitter</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
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
