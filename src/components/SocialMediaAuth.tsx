
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SocialMediaAuthProps {
  platform: "instagram" | "twitter";
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
  
  const PlatformIcon = platform === "instagram" ? Instagram : Twitter;
  const platformColor = platform === "instagram" ? "text-pink-600" : "text-blue-500";
  const platformBgColor = platform === "instagram" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-blue-500";
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={alreadyConnected ? "outline" : "default"}
          className={alreadyConnected ? "gap-2" : `gap-2 text-white ${platformBgColor}`}
        >
          <PlatformIcon className={`h-4 w-4 ${alreadyConnected ? platformColor : ""}`} />
          {alreadyConnected ? "Reconnect" : `Connect ${platform}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlatformIcon className={`h-5 w-5 ${platformColor}`} />
            Connect to {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Log in to your {platform} account to import your latest posts.
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
