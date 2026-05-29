'use client';

import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import CompanyDashboard from '@/components/dashboard/CompanyDash';
import InterviewerDashboard from '@/components/dashboard/InterviewerDash';
import CollegeDashboard from '@/components/dashboard/CollegeDash';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <LandingExperience />;
  }

  // Determine which dashboard to show based on active_persona
  switch (user.active_persona) {
    case 'company':
      return <CompanyDashboard />;
    case 'trainer':
      return <InterviewerDashboard />;
    case 'college':
      return <CollegeDashboard />;
    default:
      return <CandidateDashboard user={user} />;
  }
}

function LandingExperience() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 glass-primary">
           <Sparkles className="h-4 w-4" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Hiring, Decided.</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          The World's Most <br className="hidden sm:block" />
          <span className="text-primary italic">Intelligent</span> Hiring OS.
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Evaluate skills, validate through simulations, and hire elite talent in one seamless flow. No guesswork, just performance.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link href="/signup" className="w-full h-14 bg-primary text-primary-foreground px-10 rounded-2xl font-black shadow-xl shadow-primary/25 flex items-center justify-center">
              Get Started <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link href="/login" className="w-full h-14 bg-secondary text-secondary-foreground border border-border px-10 rounded-2xl font-black hover:bg-muted transition-all flex items-center justify-center">
              Login to Workspace
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto w-full">
        <FeatureCard 
          icon={TrendingUp} 
          title="Evaluate" 
          desc="AI-driven adaptive assessments that measure real-world technical depth." 
        />
        <FeatureCard 
          icon={ShieldCheck} 
          title="Validate" 
          desc="Secure, sandboxed coding simulations that prove candidate capability." 
        />
        <FeatureCard 
          icon={Zap} 
          title="Hire" 
          desc="Instant data-backed decisions. Move from intent to offer in minutes." 
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="p-8 rounded-3xl border border-border bg-card/50 hover:border-primary/50 transition-colors group glass"
    >
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// Placeholder dashboards until separate files are created
function CandidateDashboard({ user }: { user: any }) {
  return (
     <div className="space-y-8">
        <div className="flex justify-between items-center">
           <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Welcome, {user.full_name?.split(' ')[0] || 'Candidate'}</h1>
              <p className="text-muted-foreground mt-2 text-lg italic">The journey to your elite role is 70% complete.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 bg-card border border-border rounded-3xl shadow-sm">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                 <Sparkles className="h-6 w-6 mr-3 text-primary" />
                 Rit.ai Interview
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                 I've analyzed your Senior Engineer application. Let's begin the specialized assessment.
              </p>
              <Link href="/interview" className="h-12 bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold inline-flex items-center">
                 Start Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
           </div>
        </div>
     </div>
  );
}
