
// This is a mock server implementation for API endpoints
// In a real app, this would be a separate server or serverless functions
import { createServer } from "miragejs";
import { query } from "./integrations/db/client";

export function makeServer({ environment = "development" } = {}) {
  const server = createServer({
    environment,

    routes() {
      this.namespace = "api";

      this.post("/update-profile-picture", async (schema, request) => {
        try {
          const { userId, profileImageUrl } = JSON.parse(request.requestBody);

          if (!userId || !profileImageUrl) {
            return { error: 'Missing required fields', status: 400 };
          }

          // Update user profile in the database
          await query(
            `UPDATE users 
             SET profile_image_url = $1
             WHERE id = $2`,
            [profileImageUrl, userId]
          );

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

          // Build the SET clause dynamically based on provided updates
          const updateFields: string[] = [];
          const values: any[] = [];
          let counter = 1;
          
          if (full_name !== undefined) {
            updateFields.push(`full_name = $${counter++}`);
            values.push(full_name);
          }
          
          if (profile_image_url !== undefined) {
            updateFields.push(`profile_image_url = $${counter++}`);
            values.push(profile_image_url);
          }
          
          if (updateFields.length === 0) {
            return { error: 'No fields to update', status: 400 };
          }
          
          // Add the user ID as the last parameter
          values.push(id);
          
          // Update the user in the database
          const result = await query(
            `UPDATE users 
             SET ${updateFields.join(', ')}
             WHERE id = $${counter}
             RETURNING *`,
            values
          );
          
          if (result.rows.length === 0) {
            return { error: 'User not found', status: 404 };
          }
          
          return result.rows[0];
        } catch (error) {
          console.error('Error updating user:', error);
          return { error: 'Failed to update user', status: 500 };
        }
      });
    },
  });

  return server;
}
