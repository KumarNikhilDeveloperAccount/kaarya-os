'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  primary_role: string;
  bio?: string;
  profile_picture?: string;
  resume_data?: any;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  updateUser: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const isPublicRoute = pathname === '/login' || pathname === '/signup' || pathname === '/auth/callback';

    if (storedToken) {
      if (!token) {
        setToken(storedToken);
        fetchUser(storedToken);
      } else if (user) {
        // Enforce onboarding
        const isGuest = user.primary_role === 'guest';
        const isDefaultLinkedIn = user.primary_role === 'candidate' && (!user.full_name || user.full_name === 'LinkedIn User');
        const needsOnboarding = !user.primary_role || isGuest || isDefaultLinkedIn;
        
        const isOnboardingRoute = pathname === '/role-selection' || pathname?.startsWith('/onboarding');
        
        if (needsOnboarding && !isOnboardingRoute && !isPublicRoute) {
           router.push('/onboarding');
        }
      }
    } else {
      setLoading(false);
      // Strict redirect for unauthenticated users, except home page
      if (!isPublicRoute && pathname !== '/') {
        router.push('/login');
      }
    }
  }, [pathname, router, user, token]);

  const fetchUser = async (tokenStr: string) => {
    try {
      const response = await api.get('/api/auth/me'); 
      const userData = response.data;
      setUser(userData);
      
      if (userData.primary_role) {
        localStorage.setItem('kaarya_active_role', userData.primary_role);
        const dbProfile: any = {
          fullName: userData.full_name,
          bio: userData.bio,
          profilePic: userData.profile_picture,
          skills: userData.skills ? userData.skills.split(',') : [],
        };
        if (userData.preferences?.coverPic) dbProfile.coverPic = userData.preferences.coverPic;
        if (userData.resume_data?.resumeUrl || userData.resume_data?.resume_url) {
          dbProfile.resumeUrl = userData.resume_data.resumeUrl || userData.resume_data.resume_url;
        }
        const existingStr = localStorage.getItem(`kaarya_profile_${userData.primary_role}`);
        let existing = {};
        if (existingStr) {
           try { existing = JSON.parse(existingStr); } catch (e) {}
        }
        localStorage.setItem(`kaarya_profile_${userData.primary_role}`, JSON.stringify({ ...existing, ...dbProfile }));
      }
    } catch (err: any) {
      console.error('Failed to validate token', err);
      if (err?.response?.status === 401) {
         setUser(null);
         localStorage.removeItem('token');
         setToken(null);
      } else {
         setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    
    // Strict redirect logic upon login
    const isGuest = newUser.primary_role === 'guest';
    const isDefaultLinkedIn = newUser.primary_role === 'candidate' && (!newUser.full_name || newUser.full_name === 'LinkedIn User');
    const needsOnboarding = !newUser.primary_role || isGuest || isDefaultLinkedIn;
    
    if (needsOnboarding) {
      router.push('/onboarding');
    } else {
      router.push('/');
    }
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

