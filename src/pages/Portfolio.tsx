import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Globe, Mail, ArrowLeft, Music, Share2, Brush, Theater, Mic, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserProfile {
  name: string;
  bio: string;
  website: string;
  instagram: string;
  twitter: string;
  spotify: string;
  profilePicture: string;
  artistType: string;
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
    spotify: "",
    profilePicture: "",
    artistType: ""
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
      navigator.clipboard.writeText(shareData.url)
        .then(() => toast.success("Portfolio link copied to clipboard!"))
        .catch(() => toast.error("Couldn't copy link to clipboard."));
    }
  };

  const getArtistTypeIcon = () => {
    switch(profile.artistType) {
      case "musician":
        return <Music className="h-5 w-5 text-purple-500" />;
      case "actor":
        return <Theater className="h-5 w-5 text-blue-500" />;
      case "painter":
        return <Brush className="h-5 w-5 text-pink-500" />;
      case "comedian":
        return <Mic className="h-5 w-5 text-amber-500" />;
      case "writer":
        return <PenTool className="h-5 w-5 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getInitials = () => {
    if (!profile.name) return "A";
    
    const names = profile.name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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
          <div className="relative">
            <div className="absolute inset-0 h-48 bg-gradient-to-r from-purple-600 to-pink-500" />
            
            <div className="relative pt-24 flex justify-center">
              <Avatar className="h-40 w-40 border-4 border-white shadow-xl absolute -top-20">
                {profile.profilePicture ? (
                  <AvatarImage src={profile.profilePicture} alt={profile.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white text-4xl">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
          
          <CardHeader className="text-center pt-24 pb-0">
            <CardTitle className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              {profile.name || "Artist Portfolio"}
            </CardTitle>
            
            {profile.artistType && (
              <div className="inline-flex items-center px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full mb-4 font-medium text-sm">
                {getArtistTypeIcon()}
                <span className="ml-1.5">{profile.artistType}</span>
              </div>
            )}
            
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
