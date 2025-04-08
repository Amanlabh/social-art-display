
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
import { 
  getUserProfile, 
  getPortfolioById, 
  getUserPortfolio, 
  createPortfolio, 
  updatePortfolio, 
  generateUniqueSlug, 
  saveImage, 
  getImagesForUser,
  deleteImage,
  Portfolio as PortfolioType,
  Image,
  UserProfile
} from "@/services/portfolioService";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  const [profile, setProfile] = useState<{
    name: string;
    bio: string;
    website: string;
    instagram: string;
    twitter: string;
    spotify: string;
    profilePicture: string;
    artistType: string;
  }>({
    name: "",
    bio: "",
    website: "",
    instagram: "",
    twitter: "",
    spotify: "",
    profilePicture: "",
    artistType: ""
  });
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<Image[]>([]);
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
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // State to hold portfolio search term
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setIsDataLoading(true);
      
      try {
        // Get user profile from database
        const userProfileData = await getUserProfile(user.id);
        
        if (userProfileData) {
          setUserProfile(userProfileData);
          
          setProfile(prev => ({
            ...prev,
            name: userProfileData.full_name || user.fullName || "",
            profilePicture: userProfileData.profile_image_url || "",
          }));
        } else {
          // Use Clerk data as fallback
          setProfile(prev => ({
            ...prev,
            name: user.fullName || "",
            // profilePicture: user.imageUrl || "",
          }));
        }
        
        // Get user's portfolio
        const portfolioData = await getUserPortfolio(user.id);
        
        if (portfolioData) {
          setPortfolio(portfolioData);
          
          // Update profile with portfolio data
          setProfile(prev => ({
            ...prev,
            bio: portfolioData.description || "",
          }));
        }
        
        // Get user's images
        const imagesData = await getImagesForUser(user.id);
        if (imagesData) {
          setImages(imagesData);
        }
        
        // Load fallback data from localStorage
        const savedTracks = localStorage.getItem("userTracks");
        const savedConnections = localStorage.getItem("socialConnections");
        
        if (savedTracks) {
          setTracks(JSON.parse(savedTracks));
        }
        
        if (savedConnections) {
          setSocialConnections(JSON.parse(savedConnections));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load your profile data");
        
        // Try to load fallback data from localStorage
        const savedProfile = localStorage.getItem("userProfile");
        const savedImages = localStorage.getItem("userImages");
        
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
        
        if (savedImages) {
          setImages(JSON.parse(savedImages));
        }
      } finally {
        setIsDataLoading(false);
      }
    };
    
    loadUserData();
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

  const handleProfilePictureChange = async (url: string) => {
    setProfile(prev => ({
      ...prev,
      profilePicture: url
    }));
    
    // Also update user profile in database if user exists
    if (user) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ profile_image_url: url })
          .eq('id', user.id);
        
        if (error) throw error;
      } catch (error) {
        console.error("Failed to update profile picture in database:", error);
      }
    }
  };

  const saveProfile = async () => {
    if (!user) {
      toast.error("You need to be logged in to save your profile");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save to localStorage as fallback
      localStorage.setItem("userProfile", JSON.stringify(profile));
      
      // Update user profile in database
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: profile.name,
          profile_image_url: profile.profilePicture,
          // email and username are managed by auth
        })
        .eq('id', user.id);
      
      if (userError) throw userError;
      
      // Check if portfolio exists
      if (portfolio) {
        // Update existing portfolio
        const updatedPortfolio = await updatePortfolio(portfolio.id, {
          title: profile.name,
          description: profile.bio,
        });
        
        if (updatedPortfolio) {
          setPortfolio(updatedPortfolio);
        }
      } else {
        // Create new portfolio
        const slug = await generateUniqueSlug(profile.name || "portfolio");
        
        const newPortfolio = await createPortfolio({
          user_id: user.id,
          title: profile.name,
          description: profile.bio,
          slug,
          is_public: true,
        });
        
        if (newPortfolio) {
          setPortfolio(newPortfolio);
          toast.success("Portfolio created successfully!");
        }
      }
      
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
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
    if (!user) return;
    
    setIsFetchingImages(true);
    toast.info(`Fetching latest posts from ${platform}...`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // This is a mock implementation - in production, you'd use the actual social API
      const mockImages = Array(3).fill(0).map((_, i) => ({
        id: `${platform}-${Date.now()}-${i}`,
        url: `https://source.unsplash.com/random/600x600?art&sig=${platform}-${i}-${Date.now()}`,
        source: platform as "instagram" | "twitter"
      }));
      
      // Save images to Supabase
      for (const img of mockImages) {
        await saveImage({
          image_url: img.url,
          user_id: user.id,
          portfolio_id: portfolio?.id,
        });
      }
      
      // Refresh images from database
      const updatedImages = await getImagesForUser(user.id);
      setImages(updatedImages);
      
      // Also save to localStorage as fallback
      localStorage.setItem("userImages", JSON.stringify(updatedImages));
      
      toast.success(`Successfully imported images from ${platform}!`);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error(`Failed to fetch images from ${platform}`);
    } finally {
      setIsFetchingImages(false);
    }
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

  const handleImagesUploaded = async (urls: string[]) => {
    if (!user) {
      toast.error("You need to be logged in to upload images");
      return;
    }
    
    try {
      const newImages: Image[] = [];
      
      // Save each image to the database
      for (const url of urls) {
        const savedImage = await saveImage({
          image_url: url,
          user_id: user.id,
          portfolio_id: portfolio?.id,
        });
        
        if (savedImage) {
          newImages.push(savedImage);
        }
      }
      
      // Update the images list
      setImages(prevImages => [...prevImages, ...newImages]);
      
      // Also save to localStorage as fallback
      localStorage.setItem("userImages", JSON.stringify([...images, ...newImages]));
    } catch (error) {
      console.error("Error saving images to database:", error);
      toast.error("Failed to save images to your portfolio");
    }
  };

  const handleDeleteArtwork = async (id: string) => {
    try {
      const success = await deleteImage(id);
      
      if (success) {
        setImages(prev => prev.filter(image => image.id !== id));
        toast.success("Artwork deleted successfully!");
        
        // Update localStorage
        localStorage.setItem("userImages", JSON.stringify(images.filter(image => image.id !== id)));
      } else {
        toast.error("Failed to delete artwork");
      }
    } catch (error) {
      console.error("Error deleting artwork:", error);
      toast.error("Failed to delete artwork");
    }
  };

  const viewPortfolio = () => {
    if (portfolio?.slug) {
      navigate(`/portfolio/${portfolio.slug}`);
    } else {
      navigate("/portfolio/my-portfolio");
    }
  };

  const sharePortfolio = () => {
    const portfolioUrl = portfolio?.slug 
      ? `${window.location.origin}/portfolio/${portfolio.slug}` 
      : `${window.location.origin}/portfolio/my-portfolio`;
      
    const shareData = {
      title: `${profile.name}'s Portfolio`,
      text: `Check out ${profile.name}'s artwork!`,
      url: portfolioUrl,
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
        {isDataLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse space-y-4 w-full max-w-2xl">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
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
                    
                    {portfolio?.slug && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Portfolio URL</p>
                        <p className="text-sm text-gray-600 break-all">
                          {window.location.origin}/portfolio/{portfolio.slug}
                        </p>
                      </div>
                    )}
                    
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
                  
                  {images.length > 0 ? (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4 text-gray-900">Your Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map(image => (
                          <div key={image.id} className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]">
                            <AspectRatio ratio={1/1}>
                              <img 
                                src={image.image_url} 
                                alt="Artwork" 
                                className="w-full h-full object-cover"
                              />
                            </AspectRatio>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white flex justify-between items-center">
                                <span className="text-xs uppercase tracking-wider">
                                  artwork
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
                        ))}
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;
