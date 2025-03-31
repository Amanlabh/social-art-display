
import { createContext, useContext, ReactNode } from "react";
import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "./uploadthing-router";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

const UploadThingContext = createContext<null>(null);

export function UploadThingProvider({ children }: { children: ReactNode }) {
  return (
    <UploadThingContext.Provider value={null}>
      {children}
    </UploadThingContext.Provider>
  );
}

export function useUploadThingContext() {
  const context = useContext(UploadThingContext);
  if (context === undefined) {
    throw new Error("useUploadThingContext must be used within a UploadThingProvider");
  }
  return context;
}
