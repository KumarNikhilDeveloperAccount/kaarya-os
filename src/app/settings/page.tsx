'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Bell, Layout, Eye, Trash2, 
  ChevronRight, Camera, Smartphone, Mail, Globe, 
  Lock, LogOut, CheckCircle2 
} from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'ui', name: 'UI & Theme', icon: Layout },
    { id: 'privacy', name: 'Privacy', icon: Eye }
  ];


  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold scale-105 z-10' 
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
          <div className="pt-8 px-4">
             <button 
               onClick={handleLogout}
               className="flex items-center text-red-500 text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform"
             >
                <LogOut className="h-4 w-4 mr-2" /> Log out
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden min-h-[600px] flex flex-col">
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="p-10 h-full flex flex-col flex-1"
             >
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'notifications' && <NotificationPreferences />}
                {activeTab === 'ui' && <UISettings theme={theme} setTheme={setTheme} />}
                {activeTab === 'privacy' && <PrivacySettings />}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user, login } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [name, setName] = useState(user?.full_name || 'Kumar Nikhil');
  const [bio, setBio] = useState(user?.bio || "Building the world's most intelligent hiring OS.");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/api/auth/me', { full_name: name, bio: bio });
      const token = localStorage.getItem('token');
      if (token) login(token, response.data);
      toast.success('Core Profile Synchronized');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      toast.error('Failed to sync changes.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePhotoClick = () => {
     if (fileInputRef.current) fileInputRef.current.click();
  };
  
  const handlePhotoUpload = (e: any) => {
      // Real app would upload to S3/Cloudinary and patch the URL.
      // Mocking the success state instantly.
      if (e.target.files && e.target.files[0]) {
         toast.success('Biometric snapshot updated.');
      }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center space-x-8 pb-10 border-b border-border/50">
         <div className="relative group">
            <div className="w-28 h-28 rounded-[2rem] bg-secondary flex items-center justify-center border-2 border-dashed border-border overflow-hidden transition-all group-hover:border-primary/50">
               <User className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            <button onClick={handlePhotoClick} className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
               <Camera className="h-5 w-5" />
            </button>
         </div>
         <div>
            <h3 className="text-2xl font-black tracking-tight">Public Identification</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage how the ecosystem perceives your capability.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Legal Name</label>
            <input 
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all" 
            />
         </div>
         <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Professional Title</label>
            <input className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all" defaultValue="Founding Engineer" disabled />
         </div>
         <div className="space-y-3 sm:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Bio / Mission Statement</label>
            <textarea 
              value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all h-32 resize-none" 
            />
         </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center"
        >
           {isSaving ? 'Syncing...' : 'Save Profile Changes'}
        </button>
        {isSuccess && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center text-emerald-500 font-bold text-xs uppercase tracking-widest">
             <CheckCircle2 className="h-4 w-4 mr-2" /> Changes Saved
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="space-y-10">
       <div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Shield Control</h3>
          <p className="text-sm text-muted-foreground font-medium">Manage your cryptographic identity and session persistence.</p>
       </div>

       <div className="space-y-4">
          <button className="w-full p-6 border border-border/50 bg-secondary/20 rounded-3xl flex items-center justify-between hover:bg-secondary/40 transition-all group">
             <div className="flex items-center space-x-5">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform"><Lock className="h-6 w-6" /></div>
                <div className="text-left">
                   <p className="font-bold text-base">Rotate Access Key</p>
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Last rotated 45 days ago</p>
                </div>
             </div>
             <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="p-6 border border-border/50 bg-secondary/20 rounded-3xl flex items-center justify-between">
             <div className="flex items-center space-x-5">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Smartphone className="h-6 w-6" /></div>
                <div className="text-left">
                   <p className="font-bold text-base">Active Proximity Sessions (3)</p>
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Windows Core, iPhone 15 Pro, M3 MacBook</p>
                </div>
             </div>
             <button className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all">
                Terminate All
             </button>
          </div>
       </div>

       <div className="pt-12 border-t border-border/50 mt-auto">
          <button className="flex items-center text-red-500/60 hover:text-red-500 group transition-all">
             <Trash2 className="h-5 w-5 mr-3 group-hover:animate-bounce" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Decommission Global Account</span>
          </button>
       </div>
    </div>
  );
}

function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    hiring: true,
    interview: true,
    system: false
  });

  return (
    <div className="space-y-10">
       <div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Signal Tuning</h3>
          <p className="text-sm text-muted-foreground font-medium">Control the frequency and type of ecosystem alerts.</p>
       </div>
       
       <div className="space-y-6">
          {Object.entries({
            'Hiring Requests': 'hiring',
            'AI Assessment Reminders': 'interview',
            'System Architecture Updates': 'system'
          }).map(([label, key]) => (
            <div key={key} className="flex items-center justify-between p-6 rounded-3xl bg-secondary/30 border border-border/20">
               <div>
                  <span className="text-base font-bold block">{label}</span>
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Real-time push delivery</span>
               </div>
               <button 
                 onClick={() => setPrefs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prefs] }))}
                 className={`w-14 h-8 rounded-full relative transition-all duration-300 ${prefs[key as keyof typeof prefs] ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted border border-border'}`}
               >
                  <motion.div 
                    animate={{ x: prefs[key as keyof typeof prefs] ? 24 : 4 }}
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center`}
                  >
                     {prefs[key as keyof typeof prefs] && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </motion.div>
               </button>
            </div>
          ))}
       </div>
    </div>
  );
}

function UISettings({ theme, setTheme }: any) {
  return (
    <div className="space-y-10">
       <div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Visual Consistency</h3>
          <p className="text-sm text-muted-foreground font-medium">Select your preferred system aesthetic engine.</p>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <button 
            onClick={() => setTheme('dark')}
            className={`p-6 border rounded-[2rem] text-left transition-all relative group overflow-hidden ${
              theme === 'dark' ? 'border-primary ring-8 ring-primary/5 bg-primary/5' : 'border-border hover:border-primary/30'
            }`}
          >
             <div className="w-full aspect-[16/10] bg-[#09090b] rounded-2xl mb-5 border border-white/10 shadow-2xl transition-transform group-hover:scale-[1.02]" />
             <p className="font-extrabold text-lg">Dark Engine</p>
             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Premium OLED Optimized</p>
             {theme === 'dark' && <CheckCircle2 className="absolute top-6 right-6 h-6 w-6 text-primary" />}
          </button>

          <button 
            onClick={() => setTheme('classic')}
            className={`p-6 border rounded-[2rem] text-left transition-all relative group overflow-hidden ${
              theme === 'classic' ? 'border-primary ring-8 ring-primary/5 bg-primary/5' : 'border-border hover:border-primary/30'
            }`}
          >
             <div className="w-full aspect-[16/10] bg-[#fdfdfd] rounded-2xl mb-5 border border-black/5 shadow-2xl transition-transform group-hover:scale-[1.02]" />
             <p className="font-extrabold text-lg">Classic White</p>
             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Paper-like Precision</p>
             {theme === 'classic' && <CheckCircle2 className="absolute top-6 right-6 h-6 w-6 text-primary" />}
          </button>
       </div>
    </div>
  );
}

function PrivacySettings() {
  const [visible, setVisible] = useState(true);

  return (
    <div className="space-y-10">
       <div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Visibility Matrix</h3>
          <p className="text-sm text-muted-foreground font-medium">Control the transparency of your professional data.</p>
       </div>
       
       <div className="space-y-4">
          {[
            { label: 'Broadcast Hireability Score', desc: 'Allow companies to see your dynamic performance metrics.' },
            { label: 'Expose Simulation Logs', desc: 'Allow peer-review of your Engineering Lab sessions.' },
            { label: 'Enable Recruitment Pulse', desc: 'Allow Rit.AI to suggest you to potential hiring partners.' }
          ].map(p => (
            <div key={p.label} className="flex items-center justify-between p-6 rounded-3xl bg-secondary/30 border border-border/20 group hover:border-primary/20 transition-all">
               <div className="flex-1 pr-8">
                  <span className="text-base font-bold block">{p.label}</span>
                  <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{p.desc}</p>
               </div>
               <button 
                 onClick={() => setVisible(!visible)}
                 className={`w-14 h-8 rounded-full relative transition-all duration-300 ${visible ? 'bg-primary shadow-lg shadow-primary/10' : 'bg-muted border border-border'}`}
               >
                  <motion.div 
                    animate={{ x: visible ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm"
                  />
               </button>
            </div>
          ))}
       </div>
    </div>
  );
}
