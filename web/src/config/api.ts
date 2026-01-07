/**
 * API Configuration
 *
 * Uses NEXT_PUBLIC_API_URL environment variable in production
 * Falls back to localhost:3000 in development
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Helper function to make API requests
 */
export async function apiClient(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
