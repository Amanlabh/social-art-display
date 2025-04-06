
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { makeServer } from "./server";
import { ClerkProvider } from "@clerk/clerk-react";

// Get Clerk publishable key - using a fallback for development
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YWJzb2x1dGUtY2hpY2tlbi01OS5jbGVyay5hY2NvdW50cy5kZXYk";

// Start the mock API server
makeServer();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
