
import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Twitter, Globe, ImageIcon, PlusCircle, Music, Share2, Calendar, Search, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import SocialMediaAuth from "@/components/SocialMediaAuth";
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { ArtistTypeSelector } from "@/components/ArtistTypeSelector";
import EventsManager from "@/components/EventsManager";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [isFetchingTracks, setIsFetchingTracks] = useState(false);
  
  // State to hold portfolio search term
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const savedImages = localStorage.getItem("userImages");
    const savedTracks = localStorage.getItem("userTracks");
    const savedConnections = localStorage.getItem("socialConnections");
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.fullName || "",
      }));
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
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArtistTypeChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      artistType: value
    }));
  };

  const handleProfilePictureChange = (url: string) => {
    setProfile(prev => ({
      ...prev,
      profilePicture: url
    }));
  };

  const saveProfile = () => {
    setIsLoading(true);
    
    localStorage.setItem("userProfile", JSON.stringify(profile));
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile saved successfully!");
    }, 800);
  };

  const handleSocialConnect = (platform: "instagram" | "twitter" | "spotify", accessToken: string, username: string) => {
    setSocialConnections(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        connected: true,
        username,
        accessToken,
        lastFetched: new Date()
      }
    }));
    
    localStorage.setItem(
      "socialConnections", 
      JSON.stringify({
        ...socialConnections,
        [platform]: {
          ...socialConnections[platform],
          connected: true,
          username,
          accessToken,
          lastFetched: new Date()
        }
      })
    );
    
    setProfile(prev => ({
      ...prev,
      [platform]: username
    }));
    
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        ...profile,
        [platform]: username
      })
    );
    
    if (platform === "spotify") {
      fetchTracksFromSpotify();
    } else {
      fetchImagesFromSocial(platform);
    }
  };

  const fetchImagesFromSocial = async (platform: "instagram" | "twitter") => {
    setIsFetchingImages(true);
    toast.info(`Fetching latest posts from ${platform}...`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockImages = Array(3).fill(0).map((_, i) => ({
      id: `${platform}-${Date.now()}-${i}`,
      url: `https://source.unsplash.com/random/600x600?art&sig=${platform}-${i}-${Date.now()}`,
      source: platform as "instagram" | "twitter"
    }));
    
    setImages(prev => {
      const filtered = prev.filter(img => img.source !== platform);
      return [...filtered, ...mockImages];
    });
    
    localStorage.setItem(
      "userImages", 
      JSON.stringify([
        ...images.filter(img => img.source !== platform),
        ...mockImages
      ])
    );
    
    setIsFetchingImages(false);
    toast.success(`Successfully imported images from ${platform}!`);
  };

  const fetchTracksFromSpotify = async () => {
    setIsFetchingTracks(true);
    toast.info("Fetching latest tracks from Spotify...");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTracks = [
      {
        id: `spotify-${Date.now()}-1`,
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        coverUrl: "https://source.unsplash.com/random/300x300?album&sig=1",
        previewUrl: "https://example.com/preview1"
      },
      {
        id: `spotify-${Date.now()}-2`,
        title: "Save Your Tears",
        artist: "The Weeknd",
        album: "After Hours",
        coverUrl: "https://source.unsplash.com/random/300x300?album&sig=2",
        previewUrl: "https://example.com/preview2"
      },
      {
        id: `spotify-${Date.now()}-3`,
        title: "As It Was",
        artist: "Harry Styles",
        album: "Harry's House",
        coverUrl: "https://source.unsplash.com/random/300x300?album&sig=3",
        previewUrl: "https://example.com/preview3"
      }
    ];
    
    setTracks(mockTracks);
    
    localStorage.setItem("userTracks", JSON.stringify(mockTracks));
    
    setIsFetchingTracks(false);
    toast.success("Successfully imported tracks from Spotify!");
  };

  const handleImagesUploaded = (urls: string[]) => {
    const newImages = urls.map(url => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      source: "upload" as const
    }));
    
    setImages(prev => [...prev, ...newImages]);
    
    localStorage.setItem(
      "userImages", 
      JSON.stringify([...images, ...newImages])
    );
  };

  // New function to delete artwork
  const handleDeleteArtwork = (id: string) => {
    const updatedImages = images.filter(image => image.id !== id);
    setImages(updatedImages);
    localStorage.setItem("userImages", JSON.stringify(updatedImages));
    toast.success("Artwork deleted successfully!");
  };

  const viewPortfolio = () => {
    navigate("/portfolio/my-portfolio");
  };

  const sharePortfolio = () => {
    const shareData = {
      title: `${profile.name}'s Art Portfolio`,
      text: `Check out ${profile.name}'s artwork!`,
      url: window.location.origin + '/portfolio/my-portfolio',
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
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/portfolio/${searchTerm.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/90 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">MOTOJOJO Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Portfolio Search Form */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search profiles by ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 border-gray-200 focus-visible:ring-gray-900"
              />
              <Button type="submit" variant="outline" size="sm">
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
            </form>
            
            <Button 
              variant="outline" 
              onClick={viewPortfolio}
              className="border-gray-200 hover:bg-gray-50 transition-all"
            >
              View Portfolio
            </Button>
            <Button 
              variant="outline" 
              onClick={sharePortfolio}
              className="border-gray-200 hover:bg-gray-50 transition-all flex gap-2 items-center"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <UserButton />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8 p-1 bg-gray-100/50 rounded-xl">
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Profile</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Gallery</TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Events</TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Social Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="border shadow-md overflow-hidden bg-white rounded-xl">
              <CardHeader>
                <CardTitle>Artist Profile</CardTitle>
                <CardDescription>
                  Update your profile information visible to visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 py-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <ProfilePictureUploader 
                      initialImageUrl={profile.profilePicture}
                      onImageUploaded={handleProfilePictureChange}
                      size="xl"
                    />
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Display Name
                        </label>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="Your Artist Name" 
                          value={profile.name}
                          onChange={handleProfileChange}
                          className="border-gray-200 focus-visible:ring-gray-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="artistType" className="text-sm font-medium">
                          Artist Type
                        </label>
                        <ArtistTypeSelector 
                          value={profile.artistType}
                          onChange={handleArtistTypeChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      placeholder="Tell visitors about yourself and your art"
                      value={profile.bio}
                      onChange={handleProfileChange}
                      rows={4}
                      className="border-gray-200 focus-visible:ring-gray-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="website" className="text-sm font-medium">
                      Website
                    </label>
                    <Input 
                      id="website" 
                      name="website" 
                      placeholder="https://your-website.com" 
                      value={profile.website}
                      onChange={handleProfileChange}
                      className="border-gray-200 focus-visible:ring-gray-500"
                    />
                  </div>
                  
                  <Button 
                    onClick={saveProfile} 
                    disabled={isLoading}
                    className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="gallery">
            <Card className="border shadow-md overflow-hidden bg-white rounded-xl">
              <CardHeader>
                <CardTitle>Artwork Gallery</CardTitle>
                <CardDescription>
                  Upload and manage your artwork
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUploader onImagesUploaded={handleImagesUploaded} />
                
                {images.filter(img => img.source === "upload").length > 0 ? (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4 text-gray-900">Your Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images
                        .filter(img => img.source === "upload")
                        .map(image => (
                          <div key={image.id} className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                            <img 
                              src={image.url} 
                              alt="Artwork" 
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white flex justify-between items-center">
                                <span className="text-xs uppercase tracking-wider">
                                  {image.source}
                                </span>
                                <button 
                                  onClick={() => handleDeleteArtwork(image.id)}
                                  className="text-white hover:text-red-300 transition-colors p-1"
                                  aria-label="Delete artwork"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center p-8 border border-dashed rounded-xl border-gray-200">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No images yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by uploading images or connecting your social accounts
                    </p>
                  </div>
                )}
                
                {tracks.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-lg font-medium mb-4 text-gray-900">Your Tracks</h3>
                    <div className="space-y-4">
                      {tracks.map(track => (
                        <div key={track.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <img 
                            src={track.coverUrl} 
                            alt={track.album}
                            className="w-12 h-12 object-cover rounded-md shadow-sm"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{track.title}</h4>
                            <p className="text-sm text-gray-500">{track.artist} • {track.album}</p>
                          </div>
                          {track.previewUrl && (
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Music className="h-4 w-4 mr-1" /> Play
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events">
            <EventsManager />
          </TabsContent>
          
          <TabsContent value="social">
            <Card className="border shadow-md overflow-hidden bg-white rounded-xl">
              <CardHeader>
                <CardTitle>Social Media Connections</CardTitle>
                <CardDescription>
                  Connect your accounts to import your latest posts and tracks
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 py-4">
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="bg-pink-500 rounded-full p-2 text-white">
                        <Instagram className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Instagram</h3>
                        <p className="text-sm text-gray-500">
                          Import your latest Instagram posts
                        </p>
                        {socialConnections.instagram.connected && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">
                            Connected as @{socialConnections.instagram.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {socialConnections.instagram.connected ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => fetchImagesFromSocial("instagram")}
                            disabled={isFetchingImages}
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            Refresh Images
                          </Button>
                          <SocialMediaAuth 
                            platform="instagram" 
                            onSuccess={(token, username) => handleSocialConnect("instagram", token, username)}
                            alreadyConnected={true}
                          />
                        </>
                      ) : (
                        <SocialMediaAuth 
                          platform="instagram" 
                          onSuccess={(token, username) => handleSocialConnect("instagram", token, username)}
                          alreadyConnected={false}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500 rounded-full p-2 text-white">
                        <Twitter className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Twitter</h3>
                        <p className="text-sm text-gray-500">
                          Import your latest Twitter posts with images
                        </p>
                        {socialConnections.twitter.connected && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">
                            Connected as @{socialConnections.twitter.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {socialConnections.twitter.connected ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => fetchImagesFromSocial("twitter")}
                            disabled={isFetchingImages}
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            Refresh Images
                          </Button>
                          <SocialMediaAuth 
                            platform="twitter" 
                            onSuccess={(token, username) => handleSocialConnect("twitter", token, username)}
                            alreadyConnected={true}
                          />
                        </>
                      ) : (
                        <SocialMediaAuth 
                          platform="twitter" 
                          onSuccess={(token, username) => handleSocialConnect("twitter", token, username)}
                          alreadyConnected={false}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-600 rounded-full p-2 text-white">
                        <Music className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Spotify</h3>
                        <p className="text-sm text-gray-500">
                          Import your latest tracks and playlists
                        </p>
                        {socialConnections.spotify.connected && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">
                            Connected as @{socialConnections.spotify.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {socialConnections.spotify.connected ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={fetchTracksFromSpotify}
                            disabled={isFetchingTracks}
                            className="border-gray-200 hover:bg-gray-50"
                          >
                            Refresh Tracks
                          </Button>
                          <SocialMediaAuth 
                            platform="spotify" 
                            onSuccess={(token, username) => handleSocialConnect("spotify", token, username)}
                            alreadyConnected={true}
                          />
                        </>
                      ) : (
                        <SocialMediaAuth 
                          platform="spotify" 
                          onSuccess={(token, username) => handleSocialConnect("spotify", token, username)}
                          alreadyConnected={false}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 text-center justify-center">
                    <div className="w-full max-w-md py-3 px-4 bg-gray-50 rounded-lg text-gray-500 text-sm flex items-center justify-center gap-2">
                      <PlusCircle className="h-4 w-4 text-gray-400" />
                      <span>More platforms coming soon</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
