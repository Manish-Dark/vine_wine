import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isApproved: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { user: null, token: null };
      }
    }
    return { user: null, token: null };
  });

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth');
    }
  }, [auth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    setAuth(data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | void> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    
    // If we got a token (admin), log them in. Otherwise, we inform that approval is needed.
    if (data.token) {
      setAuth(data);
    } else {
      return data.message;
    }
  }, []);

  const logout = useCallback(() => {
    setAuth({ user: null, token: null });
  }, []);

  return {
    ...auth,
    login,
    register,
    logout,
    isAuthenticated: !!auth.token,
  };
}
