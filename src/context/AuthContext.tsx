'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse, RegisterInput, LoginInput, ProfileUpdateInput } from '../lib/types';
import * as api from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function getUserFromStorage(): User | null {
  const raw = localStorage.getItem('worknoon_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getTokenFromStorage(): string | null {
  return localStorage.getItem('worknoon_token');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUserFromStorage();
    const storedToken = getTokenFromStorage();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const persistAuth = useCallback((response: AuthResponse) => {
    const { token: t, ...rest } = response;
    const userData: User = {
      ...rest,
      isOnline: true,
      lastActive: new Date().toISOString(),
    };
    localStorage.setItem('worknoon_token', t);
    localStorage.setItem('worknoon_user', JSON.stringify(userData));
    setToken(t);
    setUser(userData);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await api.login(input);
    persistAuth(response);
  }, [persistAuth]);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await api.register(input);
    persistAuth(response);
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('worknoon_token');
    localStorage.removeItem('worknoon_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateInput) => {
    if (!token) throw new Error('Not authenticated');
    const response = await api.updateProfile(token, data);
    persistAuth(response);
  }, [token, persistAuth]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
