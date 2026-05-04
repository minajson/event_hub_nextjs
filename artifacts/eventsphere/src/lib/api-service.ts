/**
 * API Service - Central configuration for backend API communication
 * 
 * This service configures the API client with the base URL from environment
 * variables and provides helper functions for common API operations.
 */

import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

// Initialize API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3010/api/v1";

// Configure the API client with the base URL
setBaseUrl(API_BASE_URL);

// Auth token storage key
const AUTH_TOKEN_KEY = "eventsphere_auth_token";

/**
 * Initialize auth token getter for authenticated requests
 * Call this on app startup to enable authenticated API calls
 */
export function initAuth(): void {
  setAuthTokenGetter(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });
}

/**
 * Store auth token after successful login
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove auth token (logout)
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Export the API base URL for reference
export const API_URL = API_BASE_URL;

console.log(`[API Service] Configured with base URL: ${API_BASE_URL}`);