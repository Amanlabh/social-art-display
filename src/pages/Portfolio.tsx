
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Instagram, Twitter, Globe, Mail, ArrowLeft, Music, Share2, Brush, Theater, Mic, PenTool, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: "workshop" | "performance" | "exhibition" | "other";
}

interface SocialConnection {
  platform: "instagram" | "twitter" | "spotify";
  connected: boolean;
  username: string;
  accessToken: string;
  lastFetched?: Date;
}

const Portfolio = () => {
  const isMobile = useIsMobile();
  const { id } = useParams<{id: string}>();
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
  const [events, setEvents] = useState<Event[]>([]);
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
    // Load data from localStorage when component mounts
    const savedProfile = localStorage.getItem("userProfile");
    const savedImages = localStorage.getItem("userImages");
    const savedTracks = localStorage.getItem("userTracks");
    const savedConnections = localStorage.getItem("socialConnections");
    const savedEvents = localStorage.getItem("userEvents");
    
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
    
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
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
        return <Music className="h-5 w-5" />;
      case "actor":
        return <Theater className="h-5 w-5" />;
      case "painter":
        return <Brush className="h-5 w-5" />;
      case "comedian":
        return <Mic className="h-5 w-5" />;
      case "writer":
        return <PenTool className="h-5 w-5" />;
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

  // Only display uploaded images
  const uploadedImages = images.filter(image => image.source === "upload");

  // Get upcoming events (events with dates in the future)
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto px-4 py-4 flex items-center justify-between sticky top-0 z-10 bg-white border-b">
        <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className={isMobile ? "sr-only" : ""}>Back to Dashboard</span>
        </Link>
        <Button 
          variant="outline" 
          onClick={sharePortfolio}
          className="flex gap-2 items-center"
          size={isMobile ? "sm" : "default"}
        >
          <Share2 className="h-4 w-4" />
          {isMobile ? "" : "Share Portfolio"}
        </Button>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto border shadow overflow-hidden bg-white rounded-xl mb-8">
          <div className="relative">
            <div className="h-32 bg-gray-100" />
            
            <div className="relative flex justify-center">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-md absolute -top-12 sm:-top-16">
                {profile.profilePicture ? (
                  <AvatarImage src={profile.profilePicture} alt={profile.name} />
                ) : (
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl sm:text-4xl">
                    {getInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
          
          <CardHeader className="text-center pt-16 sm:pt-20 pb-0">
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
              {profile.name || "Artist Portfolio"}
            </CardTitle>
            
            {profile.artistType && (
              <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full mb-3 font-medium text-sm">
                {getArtistTypeIcon()}
                <span className="ml-1.5">{profile.artistType}</span>
              </div>
            )}
            
            {profile.bio && (
              <CardDescription className="text-base sm:text-lg mb-4 text-gray-600 max-w-2xl mx-auto">
                {profile.bio}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <div className="flex justify-center gap-6">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                   className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
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
          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-700" />
                <span>Upcoming Events</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map(event => (
                  <Card key={event.id} className="border shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full">
                          {event.type}
                        </span>
                      </div>
                      <CardDescription>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-1"><strong>Location:</strong> {event.location}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Artwork Section */}
          {uploadedImages.length > 0 ? (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-5 text-gray-900">My Artwork</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map(image => (
                  <div key={image.id} className="group">
                    <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                      <AspectRatio ratio={1/1}>
                        <img 
                          src={image.url} 
                          alt="Artwork" 
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-12 border border-dashed rounded-lg border-gray-200 bg-gray-50 mb-10">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Artwork Uploaded Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This artist hasn't uploaded any artwork to their portfolio yet.
              </p>
            </div>
          )}
          
          {/* Spotify Tracks Section */}
          {tracks.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-900">
                <Music className="w-5 h-5 text-green-600" />
                <span>Spotify</span>
                {profile.spotify && <span className="text-base font-normal text-gray-500">@{profile.spotify}</span>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.map(track => (
                  <Card key={track.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                    <div className="relative h-44">
                      <img 
                        src={track.coverUrl} 
                        alt={track.album}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-3 text-white">
                        <h3 className="font-bold truncate">{track.title}</h3>
                        <p className="text-sm text-white/90 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500 truncate">{track.album}</span>
                      {track.previewUrl && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                          <Music className="h-3 w-3" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
