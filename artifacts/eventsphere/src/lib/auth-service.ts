/**
 * Auth Service - Authentication operations
 * 
 * Provides login, logout, and user management functionality.
 * Includes demo login credentials for testing different user roles.
 */

import { customFetch, ApiError } from "@workspace/api-client-react";
import { setAuthToken, clearAuthToken, getAuthToken, isAuthenticated } from "./api-service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: "admin" | "organizer" | "student";
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "organizer" | "student";
}

// ---------------------------------------------------------------------------
// Demo Accounts
// ---------------------------------------------------------------------------

export const DEMO_ACCOUNTS = {
  admin: {
    email: "robert.k@admin.edu",
    password: "admin123",
    label: "Admin Dashboard",
  },
  organizer: {
    email: "s.jenkins@faculty.edu",
    password: "admin123",
    label: "Organizer Dashboard",
  },
  student: {
    email: "alex.j@university.edu",
    password: "admin123",
    label: "Student Dashboard",
  },
} as const;

export type DemoAccountKey = keyof typeof DEMO_ACCOUNTS;

// ---------------------------------------------------------------------------
// Auth API Functions
// ---------------------------------------------------------------------------

/**
 * Login with email and password
 * @throws {ApiError} When credentials are invalid
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await customFetch<AuthResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  // Store the token for future requests
  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
}

/**
 * Register a new user account
 */
export async function register(userData: {
  email: string;
  password: string;
  name: string;
  role?: string;
}): Promise<AuthResponse> {
  const response = await customFetch<AuthResponse>("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
}

/**
 * Logout the current user
 */
export function logout(): void {
  clearAuthToken();
  // Optionally call the logout endpoint
  // customFetch("/auth/logout", { method: "POST" }).catch(() => {});
}

/**
 * Get the current user's profile
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    return await customFetch<User>("/auth/me", {
      method: "GET",
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      logout();
    }
    return null;
  }
}

/**
 * Login with a demo account (for testing)
 */
export async function loginWithDemoAccount(account: DemoAccountKey): Promise<AuthResponse> {
  const credentials = DEMO_ACCOUNTS[account];
  if (!credentials) {
    throw new Error(`Unknown demo account: ${account}`);
  }
  return login(credentials);
}

/**
 * Get the current auth token (for debugging or manual API calls)
 */
export function getToken(): string | null {
  return getAuthToken();
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: DemoAccountKey): boolean {
  if (!user) return false;
  
  const roleMapping: Record<DemoAccountKey, string> = {
    admin: "admin",
    organizer: "organizer",
    student: "student",
  };
  
  return user.role === roleMapping[role];
}