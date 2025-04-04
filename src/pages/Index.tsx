
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Image, Palette, Users, Calendar } from "lucide-react";

const Index = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Palette className="w-8 h-8 text-gray-900 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900">MOTOJOJO</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <SignedIn>
            <Button asChild variant="ghost" className="hover:scale-105 transition-transform">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>
          <SignedOut>
            <Button asChild variant="ghost" className="hidden xs:flex hover:scale-105 transition-transform">
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white hover:scale-105 transition-transform">
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </SignedOut>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 sm:py-16 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 animate-enter">
            Your Art Deserves a Beautiful Home
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-gray-700 animate-enter" style={{ animationDelay: "100ms" }}>
            Create a stunning portfolio that showcases your work. Connect your social media 
            accounts, upload your best pieces, and share your creative journey with the world.
          </p>
          
          <SignedOut>
            <Button 
              asChild 
              size="lg" 
              className="bg-gray-900 hover:bg-gray-800 text-white hover:scale-105 transition-transform animate-enter"
              style={{ animationDelay: "200ms" }}
            >
              <Link to="/sign-up">
                Create Your Portfolio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button 
              asChild 
              size="lg" 
              className="bg-gray-900 hover:bg-gray-800 text-white hover:scale-105 transition-transform animate-enter"
              style={{ animationDelay: "200ms" }}
            >
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </SignedIn>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <FeatureCard 
            icon={<Image className="w-8 h-8 text-gray-900" />}
            title="Showcase Your Work"
            description="Upload your best pieces and organize them into a beautiful portfolio that highlights your unique style."
            delay={0} 
          />
          <FeatureCard 
            icon={<Calendar className="w-8 h-8 text-gray-900" />}
            title="Promote Your Events"
            description="Share your upcoming performances, exhibitions, and workshops with your audience."
            delay={100} 
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-gray-900" />}
            title="Connect Social Media"
            description="Link your Instagram or other social accounts to automatically import your latest posts." 
            delay={200}
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description,
  delay = 0
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay?: number;
}) => {
  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:translate-y-[-4px] animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
