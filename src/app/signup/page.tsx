'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck, Linkedin, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api, { API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';

function SignupContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const directRole = searchParams.get('role');
  const { login } = useAuth();

  const finalizeSignup = async (token: string, userData: any) => {
    try {
      if (directRole) {
        await api.patch('/api/auth/me', { primary_role: directRole }, { headers: { Authorization: `Bearer ${token}` } });
        userData.primary_role = directRole;
      }
    } catch (e) {
      console.error("Failed to auto-assign role", e);
    }
    
    login(token, userData);
    setIsSuccess(true);
    toast.success(directRole ? `Identity Created as ${directRole}` : 'Identity Created Successfully');
    
    setTimeout(() => {
      router.push(directRole ? '/' : '/onboarding');
    }, 2000);
  };

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/signup', {
        email,
        password,
        full_name: fullName
      });

      const token = response.data.access_token;
      if (!token) throw new Error("No token received");

      const userResponse = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      finalizeSignup(token, userResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
      toast.error('Signup Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedinSignup = () => {
    let url = `${API_BASE_URL}/api/auth/linkedin/start`;
    if (directRole) url += `?state=${directRole}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center mb-6 group">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl">
                <Image src="/kaarya-logo-final.png" alt="Kaarya OS Logo" fill className="object-contain" />
              </div>
            </div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 tracking-tighter group-hover:scale-105 transition-transform">
              Kaarya.OS
            </h1>
          </Link>
          <h2 className="text-2xl font-black tracking-tight uppercase text-[12px] text-muted-foreground tracking-[0.3em]">Create Account</h2>
          <p className="text-muted-foreground mt-4 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            Join the most intelligent hiring ecosystem on the planet.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border p-10 rounded-[3rem] text-center space-y-6 shadow-2xl backdrop-blur-md"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                 <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Access Granted</h3>
              <p className="text-muted-foreground text-sm font-medium">
                Welcome to the command center. Redirecting to onboarding...
              </p>
              <div className="pt-4 flex justify-center">
                 <motion.div 
                    animate={{ x: [0, 10, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                 >
                    <ArrowRight className="h-6 w-6 text-primary" />
                 </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border/50 p-10 rounded-[3rem] shadow-2xl space-y-8 backdrop-blur-md"
            >
              <motion.form 
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePasswordSignup} 
                className="space-y-5"
              >
                <InputGroup label="Full Name" icon={<User className="h-4 w-4" />} value={fullName} onChange={setFullName} placeholder="Jane Doe" required />
                <InputGroup label="Email Address" icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} type="email" placeholder="name@company.com" required />
                <InputGroup label="Access Key" icon={<Lock className="h-4 w-4" />} value={password} onChange={setPassword} type="password" placeholder="••••••••" required />

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 font-black uppercase tracking-widest bg-red-500/5 p-3 rounded-lg border border-red-500/10 flex items-center">
                    • {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 mt-6 uppercase tracking-widest text-sm"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Create Account</span> <ArrowRight className="h-4 w-4" /></>}
                </button>
              </motion.form>

              <div className="relative my-8 text-center uppercase">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border/50" />
                <span className="relative bg-card px-4 text-[9px] font-black text-muted-foreground tracking-widest">Or Synchronize With</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  type="button"
                  onClick={handleLinkedinSignup}
                  className="flex items-center justify-center h-14 bg-[#0077b5] text-white hover:shadow-lg hover:shadow-[#0077b5]/20 rounded-2xl transition-all space-x-3 font-black text-sm uppercase tracking-widest"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>Continue with LinkedIn</span>
                </button>
              </div>

              <p className="text-center text-[10px] font-black text-muted-foreground mt-8 uppercase tracking-widest">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in here</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function InputGroup({ label, icon, value, onChange, type = "text", placeholder, required = false, maxLength }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input
          required={required}
          type={type}
          maxLength={maxLength}
          className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none transition-all font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/5"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
