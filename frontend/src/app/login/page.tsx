'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Key, Linkedin, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

function LoginPageInner() {
  const [email, setEmail] = useState('nkashyapnikhilnk@gmail.com'); 
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('9315600875');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signInWithPhone, verifyEmailLink } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const emailAuth = searchParams.get('emailAuth');
    
    if (emailAuth) {
      const email = window.localStorage.getItem('emailForSignIn');
      const authEmail = email || window.prompt('Please provide your email for confirmation');
      if (authEmail) {
        verifyEmailLink(authEmail, window.location.href).then((userData) => {
          toast.success('Magic Link Verified Successfully!');
          if (!userData.roles) {
            window.location.href = '/role-selection';
          }
        }).catch((err) => {
          console.error(err);
          toast.error('Invalid or Expired Magic Link');
        });
      }
      return;
    }

    if (!token) return;

    (async () => {
      try {
        localStorage.setItem('token', token);
        const userResponse = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        login(token, userResponse.data);
        toast.success('LinkedIn identity synchronized.');
      } catch {
        toast.error('LinkedIn login failed.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await api.post('/api/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = response.data.access_token;
      const userResponse = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      login(token, userResponse.data);
      toast.success('Access Granted. Welcome back.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
      toast.error('Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!email) return toast.error('Email required');
    setIsLoading(true);
    try {
      setOtpSent(true);
      await api.post('/api/auth/otp/request', { email });
      toast.success('OTP sent to your email.');
    } catch (err) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/otp/verify', { email, code: otp });
      const token = response.data.access_token;
      const userResponse = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      login(token, userResponse.data);
      toast.success('Identity Verified');
      if (!userResponse.data.roles) {
        window.location.href = '/role-selection';
      }
    } catch (err) {
      toast.error('Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPhoneOtp = async () => {
    if (!phone) return toast.error('Phone number required');
    setIsLoading(true);
    try {
      const confirmation = await signInWithPhone(phone);
      setConfirmationResult(confirmation);
      setPhoneOtpSent(true);
      toast.success('Phone OTP sent!');
    } catch (error) {
      toast.error('Failed to send phone OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(phoneOtp);
      const idToken = await result.user.getIdToken();
      const response = await api.post('/api/auth/firebase-login', { idToken });
      const { access_token, user: userData } = response.data;
      login(access_token, userData);
      toast.success('Phone Verified');
      if (!userData.roles) {
        window.location.href = '/role-selection';
      }
    } catch (error) {
      toast.error('Invalid phone OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedinLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/auth/linkedin/start`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md p-10 bg-card border border-border/50 shadow-2xl rounded-[3rem] relative z-10 backdrop-blur-sm"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4 group hover:scale-110 transition-transform">
             <ShieldCheck className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 tracking-tighter">Kaarya.OS</h1>
          <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] text-[10px]">Security Gateway</p>
        </div>

        <div className="flex bg-secondary p-1 rounded-2xl mb-8">
           <button 
             onClick={() => { setIsOtpMode(false); setIsPhoneMode(false); }}
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isOtpMode && !isPhoneMode ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             Password
           </button>
           <button 
             onClick={() => { setIsOtpMode(true); setIsPhoneMode(false); }}
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isOtpMode && !isPhoneMode ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             Email OTP
           </button>
           <button 
             onClick={() => { setIsPhoneMode(true); setIsOtpMode(false); }}
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isPhoneMode ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             Phone OTP
           </button>
        </div>

        <AnimatePresence mode="wait">
          {!isOtpMode && !isPhoneMode ? (
            <motion.form 
              key="password"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePasswordLogin} 
              className="space-y-6"
            >
              <InputGroup label="Work Identity" icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} type="email" placeholder="name@organization.com" />
              <InputGroup label="Access Key" icon={<Lock className="h-4 w-4" />} value={password} onChange={setPassword} type="password" placeholder="••••••••" />
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Enter Workspace</span> <ArrowRight className="h-4 w-4" /></>}
              </button>
            </motion.form>
          ) : isOtpMode && !isPhoneMode ? (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-6"
            >
              <InputGroup label="Work Identity" icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} type="email" placeholder="name@organization.com" />
              
              {otpSent ? (
                <InputGroup label="Verification Code" icon={<Key className="h-4 w-4" />} value={otp} onChange={setOtp} type="text" placeholder="6-digit code" />
              ) : null}

              {!otpSent ? (
                <button 
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading || !email}
                  className="w-full h-14 bg-secondary text-foreground font-black rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Request Access Code</span>}
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Verify & Enter</span>}
                </button>
              )}
            </motion.form>
          ) : isPhoneMode ? (
            <motion.form 
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyPhoneOtp} 
              className="space-y-6"
            >
              <InputGroup label="Phone Number" icon={<Key className="h-4 w-4" />} value={phone} onChange={setPhone} type="tel" placeholder="+1234567890" />
              
              {phoneOtpSent ? (
                <InputGroup label="Phone Verification Code" icon={<Key className="h-4 w-4" />} value={phoneOtp} onChange={setPhoneOtp} type="text" placeholder="6-digit code" />
              ) : null}

              {!phoneOtpSent ? (
                <button 
                  type="button"
                  onClick={handleRequestPhoneOtp}
                  disabled={isLoading || !phone}
                  className="w-full h-14 bg-secondary text-foreground font-black rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Send Phone OTP</span>}
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Verify Phone & Enter</span>}
                </button>
              )}
            </motion.form>
          ) : null}
        </AnimatePresence>

        <div className="relative my-10 text-center uppercase">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border/50" />
          <span className="relative bg-card px-4 text-[9px] font-black text-muted-foreground tracking-widest">Global Ecosystem Access</span>
        </div>

        <button 
          onClick={handleLinkedinLogin}
          className="w-full h-14 bg-[#0077b5] text-white font-black rounded-2xl flex items-center justify-center space-x-3 hover:shadow-xl hover:shadow-[#0077b5]/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          <Linkedin className="h-5 w-5" />
          <span>Sync LinkedIn Profile</span>
        </button>

        <p className="text-center text-xs font-black text-muted-foreground mt-10 uppercase tracking-widest">
          New here? <a href="/signup" className="text-primary hover:underline">Register Identity</a>
        </p>
      </motion.div>

      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function InputGroup({ label, icon, value, onChange, type, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-[0.2em]">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input 
          type={type} 
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl pl-14 pr-5 py-5 text-sm outline-none transition-all font-bold placeholder:text-muted-foreground/50 focus:ring-4 focus:ring-primary/5"
          required 
        />
      </div>
    </div>
  );
}
