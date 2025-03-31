
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Image, Palette, Users } from "lucide-react";

const Index = () => {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-purple-900">ArtistPortfolio</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <SignedIn>
            <Button asChild variant="ghost">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>
          <SignedOut>
            <Button asChild variant="ghost">
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </SignedOut>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-purple-900">
            Your Art Deserves a Beautiful Home
          </h2>
          <p className="text-xl mb-8 text-gray-700">
            Create a stunning portfolio that showcases your work. Connect your social media 
            accounts, upload your best pieces, and share your creative journey with the world.
          </p>
          <SignedOut>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/sign-up">
                Create Your Portfolio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </SignedIn>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard 
            icon={<Image className="w-8 h-8 text-purple-600" />}
            title="Showcase Your Work"
            description="Upload your best pieces and organize them into a beautiful portfolio that highlights your unique style." 
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-purple-600" />}
            title="Connect Social Media"
            description="Link your Instagram or other social accounts to automatically import your latest posts." 
          />
          <FeatureCard 
            icon={<Palette className="w-8 h-8 text-purple-600" />}
            title="Artist Profile"
            description="Create a personalized profile that tells your story and connects with your audience." 
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-purple-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
