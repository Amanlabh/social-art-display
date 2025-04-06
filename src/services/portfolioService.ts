
import { query } from "@/integrations/db/client";
import { toast } from "sonner";

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  slug: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: string;
  portfolio_id: string | null;
  user_id: string | null;
  created_at: string;
  image_url: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string;
  profile_image_url: string | null;
  created_at: string;
}

// Helper function to get current user ID - we'll need to adapt this
export async function getCurrentUserId(): Promise<string | null> {
  // In a real app, this would come from your authentication system
  // For now, we'll return a mock user ID or get from localStorage
  const mockUserId = localStorage.getItem('currentUserId') || 'user-123';
  return mockUserId;
}

export async function setCurrentUserId(userId: string) {
  localStorage.setItem('currentUserId', userId);
  return userId;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const res = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (res.rows.length === 0) return null;
    return res.rows[0] as UserProfile;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
}

export async function getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  try {
    const res = await query(
      'SELECT * FROM portfolios WHERE slug = $1',
      [slug]
    );
    
    if (res.rows.length === 0) return null;
    return res.rows[0] as Portfolio;
  } catch (error: any) {
    console.error('Error fetching portfolio by slug:', error.message);
    return null;
  }
}

export async function getPortfolioById(id: string): Promise<Portfolio | null> {
  try {
    const res = await query(
      'SELECT * FROM portfolios WHERE id = $1',
      [id]
    );
    
    if (res.rows.length === 0) return null;
    return res.rows[0] as Portfolio;
  } catch (error: any) {
    console.error('Error fetching portfolio by ID:', error.message);
    return null;
  }
}

export async function getUserPortfolio(userId: string): Promise<Portfolio | null> {
  try {
    const res = await query(
      'SELECT * FROM portfolios WHERE user_id = $1',
      [userId]
    );
    
    if (res.rows.length === 0) return null;
    return res.rows[0] as Portfolio;
  } catch (error: any) {
    console.error('Error fetching user portfolio:', error.message);
    return null;
  }
}

export async function createPortfolio(portfolioData: {
  title: string;
  description?: string | null;
  user_id: string;
  slug?: string | null;
  is_public?: boolean;
}): Promise<Portfolio | null> {
  try {
    console.log("Creating portfolio with data:", portfolioData);
    
    const res = await query(
      `INSERT INTO portfolios 
       (title, description, user_id, slug, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        portfolioData.title,
        portfolioData.description || null,
        portfolioData.user_id,
        portfolioData.slug || null,
        portfolioData.is_public !== undefined ? portfolioData.is_public : true
      ]
    );
    
    console.log("Portfolio created successfully:", res.rows[0]);
    return res.rows[0] as Portfolio;
  } catch (error: any) {
    console.error('Error creating portfolio:', error.message);
    toast.error("Failed to create portfolio");
    return null;
  }
}

export async function updatePortfolio(id: string, updates: {
  title?: string;
  description?: string | null;
  slug?: string | null;
  is_public?: boolean;
}): Promise<Portfolio | null> {
  try {
    // Build the SET clause dynamically based on provided updates
    const updateFields: string[] = [];
    const values: any[] = [];
    let counter = 1;
    
    if (updates.title !== undefined) {
      updateFields.push(`title = $${counter++}`);
      values.push(updates.title);
    }
    
    if (updates.description !== undefined) {
      updateFields.push(`description = $${counter++}`);
      values.push(updates.description);
    }
    
    if (updates.slug !== undefined) {
      updateFields.push(`slug = $${counter++}`);
      values.push(updates.slug);
    }
    
    if (updates.is_public !== undefined) {
      updateFields.push(`is_public = $${counter++}`);
      values.push(updates.is_public);
    }
    
    if (updateFields.length === 0) {
      return getPortfolioById(id); // Nothing to update
    }
    
    // Add the portfolio ID as the last parameter
    values.push(id);
    
    const res = await query(
      `UPDATE portfolios 
       SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${counter}
       RETURNING *`,
      values
    );
    
    if (res.rows.length === 0) return null;
    
    toast.success("Portfolio updated successfully");
    return res.rows[0] as Portfolio;
  } catch (error: any) {
    console.error('Error updating portfolio:', error.message);
    toast.error("Failed to update portfolio");
    return null;
  }
}

export async function getImagesForPortfolio(portfolioId: string): Promise<Image[]> {
  try {
    console.log('Fetching images for portfolio:', portfolioId);
    const res = await query(
      'SELECT * FROM images WHERE portfolio_id = $1',
      [portfolioId]
    );
    
    console.log('Found images:', res.rows.length);
    return res.rows;
  } catch (error: any) {
    console.error('Error fetching portfolio images:', error.message);
    return [];
  }
}

export async function getImagesForUser(userId: string): Promise<Image[]> {
  try {
    console.log('Fetching images for user:', userId);
    const res = await query(
      'SELECT * FROM images WHERE user_id = $1',
      [userId]
    );
    
    console.log('Images fetched for user:', res.rows.length);
    return res.rows;
  } catch (error: any) {
    console.error('Error fetching user images:', error.message);
    return [];
  }
}

export async function saveImage(imageData: {
  image_url: string;
  portfolio_id?: string | null;
  user_id?: string | null;
}): Promise<Image | null> {
  try {
    console.log('Saving image with data:', imageData);
    
    // Verify required fields are present
    if (!imageData.image_url) {
      throw new Error("Image URL is required");
    }
    
    // Get current user if userId is not provided
    let userId = imageData.user_id;
    if (!userId) {
      userId = await getCurrentUserId();
      console.log("Using current user ID for image:", userId);
    }
    
    // Insert the image into the database
    const res = await query(
      `INSERT INTO images
       (image_url, portfolio_id, user_id, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [
        imageData.image_url,
        imageData.portfolio_id || null,
        userId || null
      ]
    );
    
    console.log('Image saved successfully:', res.rows[0]);
    return res.rows[0] as Image;
  } catch (error: any) {
    console.error('Error saving image:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

export async function deleteImage(imageId: string): Promise<boolean> {
  try {
    await query(
      'DELETE FROM images WHERE id = $1',
      [imageId]
    );
    return true;
  } catch (error: any) {
    console.error('Error deleting image:', error.message);
    return false;
  }
}

export async function generateUniqueSlug(baseSlug: string): Promise<string> {
  // Slugify the base string
  let slug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!slug) slug = 'portfolio';

  // Check if slug exists
  const res = await query(
    'SELECT slug FROM portfolios WHERE slug = $1',
    [slug]
  );

  // If no conflict, return the slug
  if (res.rows.length === 0) return slug;

  // If conflict, append a random string
  const random = Math.random().toString(36).substring(2, 8);
  return `${slug}-${random}`;
}
