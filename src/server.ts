
// This is a mock server implementation for API endpoints
import { createServer } from "miragejs";
import { addMockData } from "./integrations/db/client";

export function makeServer({ environment = "development" } = {}) {
  const server = createServer({
    environment,

    routes() {
      this.namespace = "api";

      // Handle Cloudflare analytics and other external service requests
      this.passthrough('/cdn-cgi/**');
      this.passthrough('https://clerk.clerk.accounts.dev/**');
      this.passthrough('https://**/*.clerk.accounts.dev/**');
      this.passthrough('https://*.cloudflareinsights.com/**');
      
      // Return to our namespace after defining passthrough routes
      this.namespace = "api";

      this.post("/update-profile-picture", async (schema, request) => {
        try {
          const { userId, profileImageUrl } = JSON.parse(request.requestBody);

          if (!userId || !profileImageUrl) {
            return { error: 'Missing required fields', status: 400 };
          }

          // Update user profile in our mock database
          addMockData('users', {
            id: userId,
            profile_image_url: profileImageUrl,
            updated_at: new Date().toISOString()
          });

          return { success: true };
        } catch (error) {
          console.error('Error updating profile picture:', error);
          return { error: 'Failed to update profile picture', status: 500 };
        }
      });

      this.post("/update-user", async (schema, request) => {
        try {
          const { id, full_name, profile_image_url } = JSON.parse(request.requestBody);

          if (!id) {
            return { error: 'Missing required user ID', status: 400 };
          }

          // Update user in our mock database
          addMockData('users', {
            id,
            ...(full_name !== undefined && { full_name }),
            ...(profile_image_url !== undefined && { profile_image_url }),
            updated_at: new Date().toISOString()
          });
          
          return { 
            id,
            full_name: full_name || 'Test User',
            profile_image_url: profile_image_url || null,
            success: true
          };
        } catch (error) {
          console.error('Error updating user:', error);
          return { error: 'Failed to update user', status: 500 };
        }
      });
    },
  });

  return server;
}
