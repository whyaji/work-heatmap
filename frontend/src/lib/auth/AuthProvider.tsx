import React, { createContext, useContext, useState, useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { LoadingScreen } from './LoadingScreen';

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

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  router: any; // Router instance
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ router }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  useEffect(() => {
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
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // Import login function dynamically to avoid circular dependency
      const { login: loginApi } = await import('@/lib/api/authApi');
      const response: any = await loginApi(username, password);

      // Check if login was successful and extract data
      if (response.success && response.data) {
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
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
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

  // Show loading screen while checking authentication
  if (authState.isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      <RouterProvider router={router} context={{ auth: authState }} />
    </AuthContext.Provider>
  );
};
