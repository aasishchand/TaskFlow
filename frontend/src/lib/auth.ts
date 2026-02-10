import api from './api';
import { TOKEN_KEY, USER_KEY } from '@/utils/constants';
import type { User, LoginData, ApiResponse, AuthResponse } from '@/types';

/**
 * Store auth data in localStorage.
 */
export function setAuthData(accessToken: string, user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Clear auth data from localStorage.
 */
export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Get the stored access token.
 */
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Get the stored user from localStorage.
 */
export function getStoredUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// ─── API calls ────────────────────────────────────────────────────────

export async function loginApi(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
}

export async function registerApi(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshTokenApi(): Promise<{ accessToken: string }> {
  const response = await api.post<ApiResponse<{ accessToken: string }>>(
    '/auth/refresh'
  );
  return response.data.data!;
}

export async function getProfileApi(): Promise<{ user: User }> {
  const response = await api.get<ApiResponse<{ user: User }>>('/user/profile');
  return response.data.data!;
}

export async function updateProfileApi(data: {
  name?: string;
  email?: string;
}): Promise<{ user: User }> {
  const response = await api.put<ApiResponse<{ user: User }>>(
    '/user/profile',
    data
  );
  return response.data.data!;
}
