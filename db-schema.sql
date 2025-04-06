
-- This is a SQL script to set up your Neon database with the required schema
-- You can run this in Neon's SQL editor to create your tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  username TEXT,
  email TEXT NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id),
  user_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_portfolio_id ON images(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);

-- Insert a test user if needed
INSERT INTO users (id, full_name, username, email, profile_image_url)
VALUES 
  ('user-123', 'Test User', 'testuser', 'test@example.com', NULL)
ON CONFLICT (id) DO NOTHING;

-- You can add more test data as needed
