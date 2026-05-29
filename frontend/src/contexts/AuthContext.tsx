'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { signInWithPopup, signOut as firebaseSignOut, RecaptchaVerifier, signInWithPhoneNumber, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, type ConfirmationResult } from '@/lib/firebase';
import { auth, googleProvider } from '@/lib/firebase';

interface User {
  id: number;
  email: string;
  full_name: string;
  roles: string;
  active_persona: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  sendEmailLink: (email: string) => Promise<void>;
  verifyEmailLink: (email: string, link: string) => Promise<any>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  signInWithGoogle: async () => {},
  signInWithPhone: async () => null as any,
  sendEmailLink: async () => {},
  verifyEmailLink: async () => null,
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
    const isPublicRoute = pathname === '/login' || pathname === '/signup';

    if (storedToken) {
      if (!token) {
        setToken(storedToken);
        fetchUser(storedToken);
      } else if (user && !user.active_persona && pathname !== '/role-selection' && !isPublicRoute) {
        router.push('/role-selection');
      }
    } else {
      setLoading(false);
      if (!isPublicRoute && pathname !== '/') {
        router.push('/login');
      }
    }
  }, [pathname, router, user, token]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
        });
      } catch (e) {
        console.error("Recaptcha Init Error", e);
      }
    }
  }, []);

  const fetchUser = async (tokenStr: string) => {
    try {
      const response = await api.get('/api/auth/me'); 
      setUser(response.data);
    } catch (err) {
      console.error('Failed to validate token', err);
      // If backend is temporarily unavailable, keep the token and allow UI to render;
      // login page / protected flows will surface errors on action.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    firebaseSignOut(auth);
    router.push('/login');
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      // Send idToken to backend for verification and JWT
      const response = await api.post('/api/auth/firebase-login', { idToken });
      const { access_token, user: userData } = response.data;
      login(access_token, userData);
    } catch (error) {
      console.error('Firebase sign in error:', error);
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      const normalized =
        phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\s+/g, '')}`;
      const confirmationResult = await signInWithPhoneNumber(auth, normalized, window.recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Phone sign-in error:', error);
      throw error;
    }
  };

  const sendEmailLink = async (emailAddress: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/login?emailAuth=true',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, emailAddress, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', emailAddress);
  };

  const verifyEmailLink = async (emailAddress: string, link: string) => {
    if (isSignInWithEmailLink(auth, link)) {
      const result = await signInWithEmailLink(auth, emailAddress, link);
      const idToken = await result.user.getIdToken();
      const response = await api.post('/api/auth/firebase-login', { idToken });
      const { access_token, user: userData } = response.data;
      login(access_token, userData);
      return userData;
    }
    throw new Error('Invalid email link');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signInWithGoogle, signInWithPhone, sendEmailLink, verifyEmailLink, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
