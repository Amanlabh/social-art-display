
import { query } from "@/integrations/db/client";

// This is a mock API endpoint that would be implemented by a real backend
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, full_name, profile_image_url } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing required user ID' });
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
      return res.status(400).json({ error: 'No fields to update' });
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
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}
