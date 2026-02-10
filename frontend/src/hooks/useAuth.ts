'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { User, LoginData } from '@/types';
import {
  loginApi,
  registerApi,
  logoutApi,
  getStoredUser,
  setAuthData,
  clearAuthData,
  isAuthenticated as checkAuth,
} from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser && checkAuth()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (data: LoginData) => {
      try {
        const result = await loginApi(data);
        setAuthData(result.accessToken, result.user);
        setUser(result.user);
        toast.success('Login successful!');
        router.push('/dashboard');
      } catch (error: any) {
        const message =
          error.response?.data?.message || 'Login failed. Please try again.';
        toast.error(message);
        throw error;
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      try {
        const result = await registerApi(data);
        setAuthData(result.accessToken, result.user);
        setUser(result.user);
        toast.success('Account created successfully!');
        router.push('/dashboard');
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'Registration failed. Please try again.';
        toast.error(message);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Logout even if API call fails
    } finally {
      clearAuthData();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated: !!user && checkAuth(),
    login,
    register,
    logout,
    setUser,
  };
}
