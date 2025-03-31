
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";

const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800">
      <div className="w-full max-w-md">
        <ClerkSignUp
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-white rounded-xl shadow-xl p-6",
              headerTitle: "text-2xl font-bold text-center text-purple-800",
              headerSubtitle: "text-center text-gray-500",
              socialButtonsBlockButton: 
                "border border-gray-300 hover:border-purple-500 transition-all",
              formFieldLabel: "text-gray-700",
              formButtonPrimary: 
                "bg-purple-600 hover:bg-purple-700 text-white transition-all",
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignUp;
