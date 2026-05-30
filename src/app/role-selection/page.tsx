'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building, GraduationCap, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';

const roles = [
  {
    id: 'candidate',
    title: 'Candidate',
    description: 'Get evaluated by Rit.ai and unlock elite job opportunities.',
    icon: User,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    id: 'company',
    title: 'Company',
    description: 'Hire pre-vetted, simulation-ready talent for your team.',
    icon: Building,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'trainer',
    title: 'Interviewer',
    description: 'Conduct expert assessments and earn for every successful session.',
    icon: Briefcase,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  {
    id: 'college',
    title: 'College',
    description: 'Track student placements and partner with top companies.',
    icon: GraduationCap,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
];

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelection = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      await api.post(`/api/auth/switch-persona?persona=${selectedRole}`);
      if (selectedRole === 'candidate') {
        window.location.href = '/onboarding/candidate';
      } else if (selectedRole === 'company') {
        window.location.href = '/onboarding/company';
      } else if (selectedRole === 'trainer') {
        window.location.href = '/onboarding/trainer';
      } else if (selectedRole === 'college') {
        window.location.href = '/onboarding/college';
      } else {
        window.location.href = '/'; // Fallback
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to assign role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[160px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-secondary text-primary border border-border mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Step 2: Choose Your Path</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">How will you use Kaarya.OS?</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Select the role that best defines your goal. You can switch personas later from settings with confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-12">
          {roles.map((role) => (
            <motion.button
              key={role.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole(role.id)}
              className={`p-6 sm:p-8 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                selectedRole === role.id 
                ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10' 
                : 'bg-card border-border hover:border-primary/50'
              }`}
            >
               <div className={`w-14 h-14 rounded-2xl ${role.bg} ${role.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <role.icon className="h-7 w-7" />
               </div>
               <h3 className="text-xl font-bold mb-2">{role.title}</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
               
               {selectedRole === role.id && (
                 <motion.div 
                   layoutId="active-check"
                   className="absolute top-6 right-6 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center"
                 >
                    <ArrowRight className="h-4 w-4" />
                 </motion.div>
               )}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4">
           <button
             disabled={!selectedRole || isLoading}
             onClick={handleSelection}
             className="w-full sm:w-80 h-14 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center space-x-3"
           >
             {isLoading ? (
               <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
             ) : (
               <>
                 <span>Confirm Selection</span>
                 <ArrowRight className="h-5 w-5" />
               </>
             )}
           </button>
           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest italic animate-pulse">
             This selection will customize your entire experience.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
