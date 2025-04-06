
import { supabase } from "@/integrations/supabase/client";
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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
}

export async function getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data as Portfolio;
  } catch (error: any) {
    console.error('Error fetching portfolio by slug:', error.message);
    return null;
  }
}

export async function getPortfolioById(id: string): Promise<Portfolio | null> {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data as Portfolio;
  } catch (error: any) {
    console.error('Error fetching portfolio by ID:', error.message);
    return null;
  }
}

export async function getUserPortfolio(userId: string): Promise<Portfolio | null> {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data as Portfolio || null;
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
    
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        title: portfolioData.title,
        description: portfolioData.description || null,
        user_id: portfolioData.user_id,
        slug: portfolioData.slug || null,
        is_public: portfolioData.is_public !== undefined ? portfolioData.is_public : true
      })
      .select()
      .single();

    if (error) {
      console.error("Portfolio creation error:", error);
      throw error;
    }
    
    console.log("Portfolio created successfully:", data);
    return data as Portfolio;
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
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Portfolio updated successfully");
    return data as Portfolio;
  } catch (error: any) {
    console.error('Error updating portfolio:', error.message);
    toast.error("Failed to update portfolio");
    return null;
  }
}

export async function getImagesForPortfolio(portfolioId: string): Promise<Image[]> {
  try {
    console.log('Fetching images for portfolio:', portfolioId);
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('portfolio_id', portfolioId);

    if (error) {
      console.error('Error fetching portfolio images:', error);
      throw error;
    }
    
    console.log('Found images:', data?.length || 0);
    console.log('Image data:', data);
    return data || [];
  } catch (error: any) {
    console.error('Error fetching portfolio images:', error.message);
    return [];
  }
}

export async function getImagesForUser(userId: string): Promise<Image[]> {
  try {
    console.log('Fetching images for user:', userId);
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user images:', error);
      throw error;
    }
    
    console.log('Images fetched for user:', data?.length || 0);
    console.log('Image data:', data);
    return data || [];
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
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      console.log("Using current user ID for image:", userId);
    }
    
    // Insert the image into the database
    const { data, error } = await supabase
      .from('images')
      .insert({
        image_url: imageData.image_url,
        portfolio_id: imageData.portfolio_id || null,
        user_id: userId || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error in Supabase insert:', error);
      throw error;
    }
    
    console.log('Image saved successfully:', data);
    return data as Image;
  } catch (error: any) {
    console.error('Error saving image:', error);
    console.error('Error details:', error.message);
    return null;
  }
}

export async function deleteImage(imageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
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
  const { data } = await supabase
    .from('portfolios')
    .select('slug')
    .eq('slug', slug);

  // If no conflict, return the slug
  if (!data || data.length === 0) return slug;

  // If conflict, append a random string
  const random = Math.random().toString(36).substring(2, 8);
  return `${slug}-${random}`;
}
