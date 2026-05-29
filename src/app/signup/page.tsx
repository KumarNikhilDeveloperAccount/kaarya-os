'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck, Key, Linkedin, ArrowRight, Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';

export default function SignupPage() {
  const [email, setEmail] = useState('nkashyapnikhilnk@gmail.com');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('9315600875');
  const [otp, setOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(true);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { login, signInWithPhone, sendEmailLink, signInWithGoogle } = useAuth();

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/api/auth/signup', {
        email,
        password,
        full_name: fullName
      });

      setIsSuccess(true);
      toast.success('Identity Created Successfully');
      setTimeout(() => {
        router.push('/role-selection');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
      toast.error('Signup Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestEmailOtp = async () => {
    if (!email || !fullName) return toast.error('Email and name required');
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/otp/request', { email });
      setOtpSent(true);
      toast.success('OTP sent to your email');
      if (response.data.debug_code) {
        setOtp(response.data.debug_code);
        toast.info(`[Test Mode] OTP Auto-filled: ${response.data.debug_code}`);
      }
    } catch (err) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/otp/verify', { email, code: otp });
      const token = response.data.access_token;
      const userResponse = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      login(token, userResponse.data);
      setIsSuccess(true);
      toast.success('Identity Verified Successfully');
      setTimeout(() => {
        router.push('/role-selection');
      }, 2000);
    } catch (err) {
      toast.error('Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPhoneOtp = async () => {
    if (!phone || !fullName) return toast.error('Phone and name required');
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
      setIsSuccess(true);
      toast.success('Phone Verified Successfully');
      setTimeout(() => {
        router.push('/role-selection');
      }, 2000);
    } catch (error) {
      toast.error('Invalid phone OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedinSignup = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/auth/linkedin/start`;
  };

  const setMode = (mode: 'password' | 'email-otp' | 'phone-otp') => {
    setIsPasswordMode(mode === 'password');
    setIsOtpMode(mode === 'email-otp');
    setIsPhoneMode(mode === 'phone-otp');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 opacity-50" />
      <div id="recaptcha-container"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center mb-6 group">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
               <Image src="/logo.png" alt="Kaarya OS Logo" fill className="object-cover" />
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
                Welcome to the command center. Redirecting to role assignment...
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
              <div className="flex bg-secondary p-1 rounded-2xl mb-6">
                <button 
                  onClick={() => setMode('password')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isPasswordMode ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Password
                </button>
                <button 
                  onClick={() => setMode('email-otp')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isOtpMode ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Email OTP
                </button>
                <button 
                  onClick={() => setMode('phone-otp')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isPhoneMode ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Phone OTP
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isPasswordMode && (
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
                )}

                {isOtpMode && (
                  <motion.form 
                    key="email-otp"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleVerifyEmailOtp}
                    className="space-y-5"
                  >
                    {!otpSent ? (
                      <>
                        <InputGroup label="Full Name" icon={<User className="h-4 w-4" />} value={fullName} onChange={setFullName} placeholder="Jane Doe" required />
                        <InputGroup label="Email Address" icon={<Mail className="h-4 w-4" />} value={email} onChange={setEmail} type="email" placeholder="name@company.com" required />
                        
                        {error && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 font-black uppercase tracking-widest bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                            • {error}
                          </motion.p>
                        )}

                        <button
                          type="button"
                          onClick={handleRequestEmailOtp}
                          disabled={isLoading}
                          className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Send OTP</span> <Mail className="h-4 w-4" /></>}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center">
                          <p className="text-[12px] font-black text-primary">OTP Sent to {email}</p>
                        </div>
                        <InputGroup label="Verification Code" icon={<Key className="h-4 w-4" />} value={otp} onChange={setOtp} placeholder="000000" required maxLength={6} />
                        
                        {error && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 font-black uppercase tracking-widest bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                            • {error}
                          </motion.p>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading || otp.length !== 6}
                          className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Verify OTP</span> <ArrowRight className="h-4 w-4" /></>}
                        </button>

                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                          className="text-[10px] font-black text-primary/70 hover:text-primary text-center uppercase tracking-widest w-full mt-4"
                        >
                          Resend OTP / Use Different Email
                        </button>
                      </>
                    )}
                  </motion.form>
                )}

                {isPhoneMode && (
                  <motion.form 
                    key="phone-otp"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleVerifyPhoneOtp}
                    className="space-y-5"
                  >
                    {!phoneOtpSent ? (
                      <>
                        <InputGroup label="Full Name" icon={<User className="h-4 w-4" />} value={fullName} onChange={setFullName} placeholder="Jane Doe" required />
                        <InputGroup label="Phone Number" icon={<Phone className="h-4 w-4" />} value={phone} onChange={setPhone} type="tel" placeholder="+91 XXXXX XXXXX" required />
                        
                        {error && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 font-black uppercase tracking-widest bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                            • {error}
                          </motion.p>
                        )}

                        <button
                          type="button"
                          onClick={handleRequestPhoneOtp}
                          disabled={isLoading}
                          className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Send OTP</span> <Phone className="h-4 w-4" /></>}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center">
                          <p className="text-[12px] font-black text-primary">OTP Sent to {phone}</p>
                        </div>
                        <InputGroup label="Verification Code" icon={<Key className="h-4 w-4" />} value={phoneOtp} onChange={setPhoneOtp} placeholder="000000" required maxLength={6} />
                        
                        {error && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 font-black uppercase tracking-widest bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                            • {error}
                          </motion.p>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading || phoneOtp.length !== 6}
                          className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Verify OTP</span> <ArrowRight className="h-4 w-4" /></>}
                        </button>

                        <button
                          type="button"
                          onClick={() => { setPhoneOtpSent(false); setPhoneOtp(''); setError(''); }}
                          className="text-[10px] font-black text-primary/70 hover:text-primary text-center uppercase tracking-widest w-full"
                        >
                          Resend OTP
                        </button>
                      </>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>

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
                  <span>LinkedIn Professional</span>
                </button>
                
                <button 
                  type="button"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                      setIsSuccess(true);
                      toast.success('Google Verified Successfully');
                      setTimeout(() => {
                        router.push('/role-selection');
                      }, 2000);
                    } catch (err) {
                      toast.error('Google Sign In Failed');
                    }
                  }}
                  className="flex items-center justify-center h-14 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:shadow-lg rounded-2xl transition-all space-x-3 font-black text-sm uppercase tracking-widest"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                  <span>Google Sign-In</span>
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
