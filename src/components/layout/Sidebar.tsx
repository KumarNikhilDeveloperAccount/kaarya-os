'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, User, FileText, Code, CheckSquare, Settings, 
  Users, Building, GraduationCap, Briefcase, BarChart,
  ShieldCheck, Zap, Bell, CreditCard, HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import PerspectiveSwitcher from './PerspectiveSwitcher';
import { motion } from 'framer-motion';

interface SidebarProps {
  role?: string;
  onPersonaSwitch?: (role: string) => void;
}

export default function Sidebar({ role = 'candidate', onPersonaSwitch = () => {} }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    const common = [
      { name: 'Dashboard', href: '/', icon: Home },
    ];

    switch (role) {
      case 'company':
        return [
          { name: 'Dashboard', href: '/', icon: Home },
          { name: 'Talent Pool', href: '/candidates', icon: Users },
          { name: 'Manage Jobs', href: '/jobs/manage', icon: Briefcase },
          { name: 'Analytics', href: '/analytics', icon: BarChart },
          { name: 'Payments', href: '/billing', icon: CreditCard },
          { name: 'Settings', href: '/settings', icon: Settings },
        ];
      case 'college':
        return [
          { name: 'Performance', href: '/', icon: Home },
          { name: 'Student Directory', href: '/batches', icon: Users },
          { name: 'Placements', href: '/placements', icon: GraduationCap },
          { name: 'Corporate Partners', href: '/partners', icon: Building },
          { name: 'Settings', href: '/settings', icon: Settings },
        ];
      case 'trainer':
        return [
          { name: 'Requests', href: '/', icon: Home },
          { name: 'Calendar', href: '/interviews/requests', icon: CheckSquare },
          { name: 'Earnings', href: '/analytics', icon: Zap },
          { name: 'Feedback', href: '/feedback', icon: FileText },
          { name: 'Settings', href: '/settings', icon: Settings },
        ];
      default: // candidate
        return [
          { name: 'Journey', href: '/', icon: Home },
          { name: 'Personal Profile', href: '/profile', icon: User },
          { name: 'Resume Parser', href: '/resume', icon: FileText },
          { name: 'AI Assessment', href: '/interview', icon: ShieldCheck },
          { name: 'Engineering Lab', href: '/coding', icon: Code },
          { name: 'Help & Support', href: '/support', icon: HelpCircle },
          { name: 'Settings', href: '/settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-72 h-screen bg-card border-r border-border flex flex-col hidden md:flex sticky top-0 transition-colors duration-500">
      <div className="h-16 flex items-center px-8 border-b border-border/50 mb-6">
        <Link href="/" className="group flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
             <Image src="/kaarya-logo-final.png" alt="Kaarya OS Logo" fill className="object-cover" />
            </div>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">Kaarya.OS</h1>
        </Link>
      </div>
      
      <div className="px-8 mb-8 text-left">
        <div className="p-3 bg-secondary/50 border border-border/50 rounded-xl">
           <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-1">Active Role</p>
           <p className="text-sm font-black capitalize">{role || 'Unassigned'}</p>
        </div>
      </div>


      <nav className="flex-1 px-4 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-4">Core Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative ${
                isActive 
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 transition-transform duration-500 ${isActive ? 'text-primary' : 'group-hover:scale-110 group-hover:text-primary'}`} />
              {item.name}
              
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border/50 mt-auto bg-muted/20">
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-background/50 border border-border/50">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              KN
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Kumar Nikhil</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{role}</p>
           </div>
           <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
        </div>
        <div className="text-[9px] text-center text-muted-foreground/30 mt-6 uppercase font-bold tracking-widest">© 2026 Kaarya Operating System</div>
      </div>
    </aside>
  );
}
