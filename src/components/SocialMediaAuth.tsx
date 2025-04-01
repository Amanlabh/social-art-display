
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Music } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SocialMediaAuthProps {
  platform: "instagram" | "twitter" | "spotify";
  onSuccess: (accessToken: string, username: string) => void;
  alreadyConnected: boolean;
}

export default function SocialMediaAuth({ platform, onSuccess, alreadyConnected }: SocialMediaAuthProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    // Mock API call to simulate social media authentication
    setTimeout(() => {
      // Simulate successful login
      const mockAccessToken = `${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      onSuccess(mockAccessToken, username);
      
      toast.success(`Successfully connected to ${platform}`);
      setIsLoading(false);
      setIsOpen(false);
      
      // Reset form
      setUsername("");
      setPassword("");
    }, 1500);
  };
  
  const getPlatformIcon = () => {
    switch(platform) {
      case "instagram": 
        return <Instagram className="h-4 w-4" />;
      case "twitter": 
        return <Twitter className="h-4 w-4" />;
      case "spotify": 
        return <Music className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getPlatformColor = () => {
    switch(platform) {
      case "instagram": 
        return { text: "text-pink-600", bg: "bg-gradient-to-r from-purple-500 to-pink-500" };
      case "twitter": 
        return { text: "text-blue-500", bg: "bg-blue-500" };
      case "spotify": 
        return { text: "text-green-500", bg: "bg-green-600" };
      default:
        return { text: "text-gray-500", bg: "bg-gray-500" };
    }
  };

  const { text: platformColor, bg: platformBgColor } = getPlatformColor();
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={alreadyConnected ? "outline" : "default"}
          className={alreadyConnected ? "gap-2" : `gap-2 text-white ${platformBgColor} hover:${platformBgColor}`}
        >
          {getPlatformIcon()}
          {alreadyConnected ? "Reconnect" : `Connect ${platform}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon()}
            <span className={platformColor}>Connect to {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
          </DialogTitle>
          <DialogDescription>
            Log in to your {platform} account to import your latest {platform === "spotify" ? "tracks" : "posts"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={`Your ${platform} username`}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              disabled={isLoading}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white ${platformBgColor}`}
            >
              {isLoading ? "Connecting..." : "Connect Account"}
            </Button>
          </DialogFooter>
        </form>
        <div className="text-xs text-gray-500 text-center">
          Note: This is a demo. No actual authentication is performed.
        </div>
      </DialogContent>
    </Dialog>
  );
}
