import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { cartApi } from '../api/cartApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kalakart_token') || null);
  const [loading, setLoading] = useState(true);

  // Load current session
  const loadUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setSellerProfile(res.data.sellerProfile || null);
      } else {
        setUser(null);
        setSellerProfile(null);
      }
    } catch (err) {
      setUser(null);
      setSellerProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('kalakart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setSellerProfile(res.data.sellerProfile || null);

      // Merge local guest cart if any
      const guestCart = localStorage.getItem('kalakart_guest_cart');
      if (guestCart) {
        try {
          const items = JSON.parse(guestCart);
          if (Array.isArray(items) && items.length > 0) {
            await cartApi.mergeCart(items);
            localStorage.removeItem('kalakart_guest_cart');
          }
        } catch (e) {
          console.error('Error merging guest cart:', e);
        }
      }
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.success && res.data?.token) {
      localStorage.setItem('kalakart_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setSellerProfile(null);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network failure during logout
    } finally {
      localStorage.removeItem('kalakart_token');
      setToken(null);
      setUser(null);
      setSellerProfile(null);
    }
  };

  const refreshUser = async () => {
    return loadUser();
  };

  const value = {
    user,
    sellerProfile,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
    isApprovedSeller: user?.role === 'seller' && sellerProfile?.applicationStatus === 'approved',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
