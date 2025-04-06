import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Instagram, Twitter, Globe, Mail, ArrowLeft, Music, Share2, Brush, Theater, Mic, PenTool, Calendar, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  getUserProfile, 
  getPortfolioById, 
  getPortfolioBySlug, 
  getImagesForPortfolio, 
  getImagesForUser,
  UserProfile,
  Portfolio as PortfolioType,
  Image
} from "@/services/portfolioService";
import { supabase } from "@/integrations/supabase/client";

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioType | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const loadPortfolioData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        console.log("Loading portfolio with ID:", id);
        
        let portfolio = await getPortfolioBySlug(id);
        
        if (!portfolio) {
          console.log("No portfolio found by slug, trying with ID");
          portfolio = await getPortfolioById(id);
        }
        
        if (portfolio) {
          console.log("Portfolio found:", portfolio);
          setPortfolioData(portfolio);
          
          const userProfile = await getUserProfile(portfolio.user_id);
          if (userProfile) {
            console.log("User profile found:", userProfile);
            setProfile(userProfile);
          }
          
          console.log("Fetching images for portfolio ID:", portfolio.id);
          const portfolioImages = await getImagesForPortfolio(portfolio.id);
          console.log("Portfolio images:", portfolioImages);
          setImages(portfolioImages);
        } else if (id === "my-portfolio") {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            console.log("Current user ID for 'my-portfolio':", user.id);
            const userProfile = await getUserProfile(user.id);
            if (userProfile) {
              console.log("Current user profile:", userProfile);
              setProfile(userProfile);
            }
            
            const userPortfolio = await getUserPortfolio(user.id);
            if (userPortfolio) {
              console.log("Found user portfolio:", userPortfolio);
              setPortfolioData(userPortfolio);
              
              const portfolioImages = await getImagesForPortfolio(userPortfolio.id);
              console.log("Portfolio images:", portfolioImages);
              setImages(portfolioImages);
            } else {
              const userImages = await getImagesForUser(user.id);
              console.log("User images (no portfolio):", userImages);
              setImages(userImages);
            }
          } else {
            console.log("No authenticated user for 'my-portfolio'");
            toast.error("You must be logged in to view your portfolio");
          }
        } else {
          console.error("Portfolio not found for ID:", id);
          toast.error("Portfolio not found");
        }
      } catch (error: any) {
        console.error("Error loading portfolio:", error);
        toast.error("Failed to load portfolio");
      } finally {
        setIsLoading(false);
      }
      
      const savedTracks = localStorage.getItem("userTracks");
      if (savedTracks) {
        setTracks(JSON.parse(savedTracks));
      }
      
      const savedEvents = localStorage.getItem("userEvents");
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
      
      const savedConnections = localStorage.getItem("socialConnections");
      if (savedConnections) {
        setSocialConnections(JSON.parse(savedConnections));
      }
    };
    
    loadPortfolioData();
  }, [id]);

  const sharePortfolio = () => {
    let shareUrl = window.location.href;
    
    if (portfolioData?.id && window.location.pathname.includes("my-portfolio")) {
      const baseUrl = window.location.origin;
      shareUrl = `${baseUrl}/portfolio/${portfolioData.slug || portfolioData.id}`;
    }
    
    const portfolioName = profile?.full_name || "Artist";
    const shareData = {
      title: `${portfolioName}'s Portfolio`,
      text: `Check out ${portfolioName}'s portfolio!`,
      url: shareUrl,
    };
    
    console.log("Sharing portfolio with URL:", shareUrl);
    
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
    const artistType = profile?.full_name?.toLowerCase().includes("musician") ? "musician" :
                     profile?.full_name?.toLowerCase().includes("actor") ? "actor" :
                     profile?.full_name?.toLowerCase().includes("painter") ? "painter" :
                     profile?.full_name?.toLowerCase().includes("comedian") ? "comedian" :
                     profile?.full_name?.toLowerCase().includes("writer") ? "writer" : "";
    
    switch(artistType) {
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
    if (!profile?.full_name) return "A";
    
    const names = profile.full_name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="container mx-auto px-4 py-4 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className={isMobile ? "sr-only" : ""}>Back</span>
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
      
      {isLoading ? (
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white rounded-xl mb-8 animate-fade-in">
            <div className="relative">
              <div className="h-24 sm:h-32 bg-gradient-to-r from-purple-100 to-blue-100" />
              
              <div className="relative flex justify-center">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-md absolute -top-12 sm:-top-16 hover:scale-105 transition-transform">
                  {profile?.profile_image_url ? (
                    <AvatarImage src={profile.profile_image_url} alt={profile.full_name || ""} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-200 text-gray-700 text-2xl sm:text-4xl">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
            
            <CardHeader className="text-center pt-16 sm:pt-20 pb-0">
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
                {profile?.full_name || portfolioData?.title || "Artist Portfolio"}
              </CardTitle>
              
              {profile?.username && (
                <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full mb-3 font-medium text-sm hover:bg-gray-200 transition-colors">
                  {getArtistTypeIcon()}
                  <span className="ml-1.5">@{profile.username}</span>
                </div>
              )}
              
              {portfolioData?.description && (
                <CardDescription className="text-base sm:text-lg mb-4 text-gray-600 max-w-2xl mx-auto">
                  {portfolioData.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <div className="flex justify-center gap-6">
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="text-gray-600 hover:text-gray-900 transition-colors hover:scale-110">
                    <Mail className="w-5 h-5" />
                  </a>
                )}
                {socialConnections.instagram.connected && (
                  <a 
                    href={`https://instagram.com/${socialConnections.instagram.username}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition-colors hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialConnections.twitter.connected && (
                  <a 
                    href={`https://twitter.com/${socialConnections.twitter.username}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-500 transition-colors hover:scale-110"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {socialConnections.spotify.connected && (
                  <a 
                    href={`https://open.spotify.com/user/${socialConnections.spotify.username}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-green-500 transition-colors hover:scale-110"
                  >
                    <Music className="w-5 h-5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <h2 className="text-xl font-medium mb-5 text-gray-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-gray-700" />
                <span>Portfolio</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {images && images.length > 0 ? images.map((image, index) => (
                  <div 
                    key={image.id} 
                    className="group animate-scale-in relative overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300" 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AspectRatio ratio={1/1}>
                      <img 
                        src={image.image_url} 
                        alt="Artwork" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          console.error("Failed to load image:", image.image_url);
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </AspectRatio>
                  </div>
                )) : (
                  <div className="text-center p-12 border border-dashed rounded-lg border-gray-200 bg-white mb-10 animate-fade-in col-span-full">
                    <Camera className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Artwork Uploaded Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      This artist hasn't uploaded any artwork to their portfolio yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {upcomingEvents.length > 0 && (
              <div className="mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <h2 className="text-xl font-medium mb-5 text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-700" />
                  <span>Upcoming Events</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {upcomingEvents.map((event, index) => (
                    <Card 
                      key={event.id} 
                      className="border-none shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
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
            
            {tracks.length > 0 && (
              <div className="mb-10 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <h2 className="text-xl font-medium mb-5 flex items-center gap-2 text-gray-900">
                  <Music className="w-5 h-5 text-gray-700" />
                  <span>Music</span>
                  {socialConnections.spotify.username && (
                    <span className="text-base font-normal text-gray-500">
                      @{socialConnections.spotify.username}
                    </span>
                  )}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {tracks.map((track, index) => (
                    <Card 
                      key={track.id} 
                      className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white hover:translate-y-[-4px]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-44">
                        <img 
                          src={track.coverUrl} 
                          alt={track.album}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3 text-white">
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
      )}
    </div>
  );
};

export default Portfolio;
