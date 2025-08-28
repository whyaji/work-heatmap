import { RouterProvider } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';

import { useLoading } from '../loading/useLoading.hook';
import { AuthContext } from './useAuth.hook';

export interface User {
  id: number;
  username: string;
  nama: string;
  jabatan: string;
  kemandoran: number;
  kemandoran_ppro: number;
  kemandoran_nama: string;
  kemandoran_kode: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}
interface AuthProviderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any; // Router instance
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ router }) => {
  const { showLoading, hideLoading } = useLoading();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  useEffect(() => {
    // Show loading while checking for existing token
    showLoading();

    // Check for existing token on app load
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          token,
        });
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }

    // Hide loading when authentication check is complete
    hideLoading();
  }, [showLoading, hideLoading]);

  const login = async (username: string, password: string) => {
    try {
      showLoading();

      // Import login function dynamically to avoid circular dependency
      const { login: loginApi } = await import('@/lib/api/authApi');
      const response = await loginApi(username, password);

      // Check if login was successful and extract data
      if ('success' in response && response.success && 'data' in response && response.data) {
        const { user, token } = response.data;

        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          token,
        });
      } else {
        throw new Error('Login failed');
      }
    } catch {
      throw new Error('Login failed');
    } finally {
      hideLoading();
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });
    window.location.href = '/';
  };

  const setUser = (user: User) => {
    setAuthState((prev) => ({ ...prev, user }));
    localStorage.setItem('user_data', JSON.stringify(user));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      <RouterProvider router={router} context={{ auth: authState }} />
    </AuthContext.Provider>
  );
};
