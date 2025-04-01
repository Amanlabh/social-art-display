
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Globe, Mail, ArrowLeft, Music, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  bio: string;
  website: string;
  instagram: string;
  twitter: string;
  spotify: string;
}

interface ArtworkImage {
  id: string;
  url: string;
  source: "upload" | "instagram" | "twitter";
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl?: string;
}

interface SocialConnection {
  platform: "instagram" | "twitter" | "spotify";
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
    twitter: "",
    spotify: ""
  });
  const [images, setImages] = useState<ArtworkImage[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [socialConnections, setSocialConnections] = useState<{
    instagram: SocialConnection;
    twitter: SocialConnection;
    spotify: SocialConnection;
  }>({
    instagram: { platform: "instagram", connected: false, username: "", accessToken: "" },
    twitter: { platform: "twitter", connected: false, username: "", accessToken: "" },
    spotify: { platform: "spotify", connected: false, username: "", accessToken: "" }
  });

  useEffect(() => {
    // In a real app, we would fetch this data from an API using the portfolio ID
    // For this mock, we'll load from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    const savedImages = localStorage.getItem("userImages");
    const savedTracks = localStorage.getItem("userTracks");
    const savedConnections = localStorage.getItem("socialConnections");
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
    
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    }
    
    if (savedConnections) {
      setSocialConnections(JSON.parse(savedConnections));
    }
  }, []);

  const sharePortfolio = () => {
    // In a real app, this would generate a shareable link or open a share dialog
    const shareData = {
      title: `${profile.name}'s Art Portfolio`,
      text: `Check out ${profile.name}'s artwork!`,
      url: window.location.href,
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData)
        .then(() => toast.success("Portfolio shared successfully!"))
        .catch((error) => {
          console.error("Error sharing:", error);
          toast.error("Couldn't share portfolio. Try copying the link instead.");
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareData.url)
        .then(() => toast.success("Portfolio link copied to clipboard!"))
        .catch(() => toast.error("Couldn't copy link to clipboard."));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <Button 
          variant="outline" 
          onClick={sharePortfolio}
          className="border-purple-200 hover:bg-purple-50 transition-all flex gap-2 items-center"
        >
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </Button>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto border-none shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl mb-8">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              {profile.name || "Artist Portfolio"}
            </CardTitle>
            
            {profile.bio && (
              <CardDescription className="text-xl mb-6 text-gray-600 max-w-2xl mx-auto">
                {profile.bio}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <div className="flex justify-center gap-6">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                   className="text-gray-600 hover:text-purple-600 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              {socialConnections.instagram.connected && (
                <a 
                  href={`https://instagram.com/${profile.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialConnections.twitter.connected && (
                <a 
                  href={`https://twitter.com/${profile.twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socialConnections.spotify.connected && (
                <a 
                  href={`https://open.spotify.com/user/${profile.spotify}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  <Music className="w-5 h-5" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="max-w-5xl mx-auto">
          {images.length > 0 ? (
            <div>
              {/* Uploaded Images */}
              {images.some(img => img.source === "upload") && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">My Artwork</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images
                      .filter(image => image.source === "upload")
                      .map(image => (
                        <div key={image.id} className="group">
                          <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                            <img 
                              src={image.url} 
                              alt="Artwork" 
                              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
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
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Instagram</span>
                    {profile.instagram && <span className="text-lg font-normal text-gray-500">@{profile.instagram}</span>}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {images
                      .filter(image => image.source === "instagram")
                      .map(image => (
                        <div key={image.id} className="group">
                          <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                            <img 
                              src={image.url} 
                              alt="Instagram post" 
                              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <div className="flex items-center text-white">
                                <Instagram className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Instagram</span>
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
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Twitter className="w-6 h-6 text-blue-500" />
                    <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Twitter</span>
                    {profile.twitter && <span className="text-lg font-normal text-gray-500">@{profile.twitter}</span>}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {images
                      .filter(image => image.source === "twitter")
                      .map(image => (
                        <div key={image.id} className="group">
                          <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                            <img 
                              src={image.url} 
                              alt="Twitter post" 
                              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <div className="flex items-center text-white">
                                <Twitter className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Twitter</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Spotify Tracks */}
              {tracks.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Music className="w-6 h-6 text-green-600" />
                    <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">Spotify</span>
                    {profile.spotify && <span className="text-lg font-normal text-gray-500">@{profile.spotify}</span>}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tracks.map(track => (
                      <Card key={track.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-emerald-50 to-green-50">
                        <div className="relative h-48">
                          <img 
                            src={track.coverUrl} 
                            alt={track.album}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 text-white">
                            <h3 className="font-bold truncate">{track.title}</h3>
                            <p className="text-sm text-white/80 truncate">{track.artist}</p>
                          </div>
                        </div>
                        <CardFooter className="bg-white p-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">{track.album}</span>
                          {track.previewUrl && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-green-100 hover:bg-green-200">
                              <Music className="h-3 w-3 text-green-700" />
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-12 border border-dashed rounded-lg border-purple-200">
              <p className="text-gray-500">No artwork to display yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
