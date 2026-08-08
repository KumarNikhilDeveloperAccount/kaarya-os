'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import IntroCinematic from './IntroCinematic';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import RitPanel from '../rit/RitPanel';
import BackendStatusBanner from '@/components/system/BackendStatusBanner';
import SupportWidget from '../support/SupportWidget';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [activePersona, setActivePersona] = useState('candidate'); 
  const [showIntro, setShowIntro] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (user && user.primary_role) {
      setActivePersona(user.primary_role);
    }
  }, [user]);

  const hideLayout = loading || pathname === '/login' || pathname === '/signup' || pathname === '/role-selection' || pathname === '/onboarding';

  // If loading or login page, don't show the layout frame
  if (hideLayout) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroCinematic onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>
      
      <div className={`flex h-screen bg-background text-foreground overflow-hidden transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        <Sidebar role={activePersona} onPersonaSwitch={setActivePersona} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col w-full relative">
          {!showIntro && <BackendStatusBanner />}
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/20">
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {!showIntro && <RitPanel />}
      {!showIntro && <SupportWidget />}
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
