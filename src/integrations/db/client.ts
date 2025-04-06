
import { MockQueryResult } from './types';

// Mock implementation of the PostgreSQL client for browser environments
const mockDatabase = {
  users: [
    {
      id: 'user-123',
      full_name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      profile_image_url: null,
      created_at: new Date().toISOString()
    }
  ],
  portfolios: [],
  images: []
};

// Helper function for running SQL queries (mock implementation)
export async function query(text: string, params: any[] = []): Promise<MockQueryResult> {
  console.log('Mock query executed:', { text, params });
  
  // Simulate delay to mimic network request
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Very simple mock implementation based on the query text
  if (text.toLowerCase().includes('select * from users where id =')) {
    const userId = params[0];
    const user = mockDatabase.users.find(u => u.id === userId);
    return {
      rows: user ? [user] : [],
      rowCount: user ? 1 : 0
    };
  }
  
  if (text.toLowerCase().includes('select * from portfolios where user_id =')) {
    const userId = params[0];
    const portfolios = mockDatabase.portfolios.filter(p => p.user_id === userId);
    return {
      rows: portfolios,
      rowCount: portfolios.length
    };
  }
  
  if (text.toLowerCase().includes('select * from images where portfolio_id =')) {
    const portfolioId = params[0];
    const images = mockDatabase.images.filter(img => img.portfolio_id === portfolioId);
    return {
      rows: images,
      rowCount: images.length
    };
  }
  
  if (text.toLowerCase().includes('select * from images where user_id =')) {
    const userId = params[0];
    const images = mockDatabase.images.filter(img => img.user_id === userId);
    return {
      rows: images,
      rowCount: images.length
    };
  }
  
  // For update/insert operations, just return success
  if (text.toLowerCase().includes('update ') || text.toLowerCase().includes('insert ')) {
    return {
      rows: [],
      rowCount: 1
    };
  }
  
  // Default fallback
  return {
    rows: [],
    rowCount: 0
  };
}

// Helper function to add mock data - only for development
export function addMockData(table: 'users' | 'portfolios' | 'images', data: any) {
  mockDatabase[table].push(data);
  console.log(`Added mock data to ${table}:`, data);
}
