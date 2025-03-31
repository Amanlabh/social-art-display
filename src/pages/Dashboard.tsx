
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
import { Instagram, Twitter, Globe, ImageIcon, PlusCircle } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import SocialMediaAuth from "@/components/SocialMediaAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(false);

  // Load saved profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const savedImages = localStorage.getItem("userImages");
    const savedConnections = localStorage.getItem("socialConnections");
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user) {
      // Initialize with Clerk user data if available
      setProfile(prev => ({
        ...prev,
        name: user.fullName || "",
      }));
    }
    
    if (savedImages) {
      setImages(JSON.parse(savedImages));
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

  const saveProfile = () => {
    setIsLoading(true);
    
    // Save to localStorage (in a real app this would be an API call)
    localStorage.setItem("userProfile", JSON.stringify(profile));
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile saved successfully!");
    }, 800);
  };

  const handleSocialConnect = (platform: "instagram" | "twitter", accessToken: string, username: string) => {
    // Update the social connection state
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
    
    // Save to localStorage
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
    
    // Also update the profile with social media username
    setProfile(prev => ({
      ...prev,
      [platform]: username
    }));
    
    // Save updated profile
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        ...profile,
        [platform]: username
      })
    );
    
    // Fetch images from the platform
    fetchImagesFromSocial(platform);
  };

  const fetchImagesFromSocial = async (platform: "instagram" | "twitter") => {
    setIsFetchingImages(true);
    toast.info(`Fetching latest posts from ${platform}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock images from the platform
    const mockImages = Array(6).fill(0).map((_, i) => ({
      id: `${platform}-${Date.now()}-${i}`,
      url: `https://source.unsplash.com/random/600x600?art&sig=${platform}-${i}`,
      source: platform as "instagram" | "twitter"
    }));
    
    // Add new images to state
    setImages(prev => {
      // Filter out old images from this platform
      const filtered = prev.filter(img => img.source !== platform);
      return [...filtered, ...mockImages];
    });
    
    // Save updated images to localStorage
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

  const handleImagesUploaded = (urls: string[]) => {
    const newImages = urls.map(url => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      source: "upload" as const
    }));
    
    setImages(prev => [...prev, ...newImages]);
    
    // Save to localStorage
    localStorage.setItem(
      "userImages", 
      JSON.stringify([...images, ...newImages])
    );
  };

  const viewPortfolio = () => {
    // For the mock app, we'll just use a random ID
    // In a real app, this would be the user's unique portfolio ID
    navigate("/portfolio/my-portfolio");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-900">Artist Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={viewPortfolio}>
              View Portfolio
            </Button>
            <UserButton />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Artist Profile</CardTitle>
                <CardDescription>
                  Update your profile information visible to visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 py-4">
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
                    />
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
                    />
                  </div>
                  
                  <Button 
                    onClick={saveProfile} 
                    disabled={isLoading}
                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Artwork Gallery</CardTitle>
                <CardDescription>
                  Upload and manage your artwork
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader onImagesUploaded={handleImagesUploaded} />
                
                {images.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Your Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map(image => (
                        <div key={image.id} className="relative group">
                          <img 
                            src={image.url} 
                            alt="Artwork" 
                            className="w-full h-48 object-cover rounded-md shadow-sm"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <span className="px-2 py-1 bg-black/60 text-white text-xs uppercase rounded">
                              {image.source}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center p-8 border border-dashed rounded-md">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No images yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by uploading images or connecting your social accounts
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Connections</CardTitle>
                <CardDescription>
                  Connect your accounts to import your latest posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 py-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Instagram className="h-8 w-8 text-pink-600" />
                      <div>
                        <h3 className="font-medium">Instagram</h3>
                        <p className="text-sm text-gray-500">
                          Import your latest Instagram posts
                        </p>
                        {socialConnections.instagram.connected && (
                          <p className="text-xs text-green-600 mt-1">
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
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Twitter className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Twitter</h3>
                        <p className="text-sm text-gray-500">
                          Import your latest Twitter posts with images
                        </p>
                        {socialConnections.twitter.connected && (
                          <p className="text-xs text-green-600 mt-1">
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
                  
                  <div className="flex items-center gap-2 pt-4">
                    <PlusCircle className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-500">More platforms coming soon</span>
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
