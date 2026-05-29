'use client';

import { useState } from 'react';
import { Bot, Menu, User, Settings, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ModeToggle from './ModeToggle';
import { openRit } from '../rit/RitPanel';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Topbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();
  const persona = user?.active_persona || 'guest';
  const router = useRouter();

  const personaMap: any = {
    company: { label: 'Recruitment Hub', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    candidate: { label: 'Candidate Terminal', color: 'bg-primary/10 text-primary border-primary/20' },
    trainer: { label: 'Expert Panel', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    college: { label: 'Institutional Center', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    guest: { label: 'Secure Core', color: 'bg-secondary text-muted-foreground border-border' }
  };

  const activeInfo = personaMap[persona] || personaMap.guest;

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center">
        <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors md:hidden">
          <Menu className="h-5 w-5" />
        </button>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-lg border border-primary/20">
            <Image src="/kaarya-logo-main.png" alt="Kaarya OS" fill className="object-cover" />
          </div>
        <span className="ml-2 text-xl font-black tracking-tighter text-primary hidden md:inline">Kaarya.OS</span>
        
        <div className="hidden md:flex ml-8 items-center space-x-2">
           <div className={`h-2 w-2 rounded-full animate-pulse ${persona === 'guest' ? 'bg-muted-foreground' : 'bg-primary'}`} />
           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeInfo.color}`}>
              {activeInfo.label}
           </span>
        </div>
      </div>
      
      <div className="flex-1"></div>

      <div className="flex flex-1 justify-end items-center space-x-2 md:space-x-4">
        <button 
          onClick={() => openRit()}
          className="flex items-center justify-center p-2 text-sm font-bold rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all border border-blue-500/20 active:scale-95"
        >
          <Bot className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Rit.ai</span>
        </button>
        
        <ModeToggle />
        <NotificationBell />
        
        <div className="relative">
          <div 
             onClick={() => setProfileOpen(!profileOpen)}
             className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-sm hover:scale-110 transition-transform cursor-pointer"
          >
            KN
          </div>
          {profileOpen && (
            <div className="absolute top-10 right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 p-1">
               <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"><User className="h-4 w-4 mr-2" /> Your Profile</Link>
               <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"><Settings className="h-4 w-4 mr-2" /> Global Settings</Link>
               <div className="h-px bg-border my-2" />
               <button
                 type="button"
                 onClick={() => {
                   localStorage.removeItem('token');
                   router.push('/login');
                 }}
                 className="w-full flex items-center px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
               >
                 <LogOut className="h-4 w-4 mr-2" /> Terminate Session
               </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
