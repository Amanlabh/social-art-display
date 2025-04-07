
// This is a minimal version of server.ts that doesn't intercept real API calls
import { createServer } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  // Only create server in development when no real database URL is provided
  if (environment === "development" && !import.meta.env.VITE_DATABASE_URL) {
    console.warn("Using mock server - for development only");
    const server = createServer({
      environment,

      routes() {
        this.namespace = "api";

        // Passthrough all external services
        this.passthrough('/cdn-cgi/**');
        this.passthrough('https://clerk.clerk.accounts.dev/**');
        this.passthrough('https://**/*.clerk.accounts.dev/**');
        this.passthrough('https://*.cloudflareinsights.com/**');
        this.passthrough('https://**/*.neon.tech/**');
        
        // Passthrough all API endpoints when using real database
        this.passthrough();
      },
    });

    return server;
  }
  
  // Return a dummy server object that does nothing when using real DB
  return {
    shutdown: () => {},
    pretender: {
      handledRequest: () => {}
    }
  };
}
