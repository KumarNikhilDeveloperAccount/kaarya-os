'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

import { Suspense } from 'react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const token = searchParams.get('token');
    if (token) {
      hasProcessed.current = true;
      
      // Store temporarily so api.get uses it
      localStorage.setItem('token', token);
      
      import('@/lib/api').then(({ api }) => {
        api.get('/api/auth/me')
          .then((res) => {
             // AuthContext login handles the strict onboarding redirect logic now
             login(token, res.data);
          })
          .catch(() => {
             localStorage.removeItem('token');
             router.push('/login');
          });
      });
    } else {
      hasProcessed.current = true;
      router.push('/login');
    }
  }, [searchParams, router, login]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Authenticating Identity...</h2>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
