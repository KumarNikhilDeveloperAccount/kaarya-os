import { useState, useEffect } from 'react';
import { 
  Briefcase, CheckSquare, Zap, FileText, TrendingUp, Sparkles, 
  ArrowRight, Calendar, User, Clock, DollarSign, ChevronRight, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function InterviewerDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/dashboard/interviewer');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to sync expert intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  if (isLoading) return (
     <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
  );

  const sessions = data?.sessions || [];
  const stats = data?.stats || {};

  const enterPortal = (session: any) => {
    setSelectedSession(session);
    setIsPortalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-600">Expert Panel</h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">You have <span className="text-foreground font-bold">{sessions.length} sessions</span> scheduled today. Total Earnings: <span className="text-emerald-500 font-bold">₹4,200</span>.</p>
         </div>

         <div className="flex space-x-3">
            <button className="h-12 bg-secondary border border-border text-foreground px-6 rounded-xl font-bold flex items-center space-x-2 hover:bg-muted transition-all">
               <Calendar className="h-4 w-4" />
               <span>Manage Calendar</span>
            </button>
            <button className="h-12 bg-primary text-white px-6 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
               <DollarSign className="h-4 w-4" />
               <span>Withdraw ₹4,200</span>
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard label="Expert Quality" val={stats.expert_quality || "4.9"} icon={Sparkles} color="text-amber-500" />
         <StatsCard label="Vetted & Verified" val={stats.completed || "12"} icon={CheckSquare} color="text-emerald-500" />
         <StatsCard label="Active Track" val={stats.active_track || "Fullstack"} icon={Briefcase} color="text-primary" />
      </div>

      <div className="glass rounded-[3rem] overflow-hidden">
         <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="font-black uppercase tracking-tighter text-xl flex items-center">
               <Clock className="h-6 w-6 mr-3 text-primary" />
               Technical Assessment Window
            </h3>
         </div>

         <div className="divide-y divide-border">
             {sessions.map((s: any) => (
               <div key={s.name} className="p-6 hover:bg-white/5 transition-all flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between group">
                  <div className="flex items-center space-x-6">
                     <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary font-black shadow-inner">
                        <User className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-lg font-bold tracking-tight">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{s.track}</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-12">
                     <div className="text-left sm:text-right">
                        <p className="text-base font-black text-glow">{s.time}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Session Slot</p>
                     </div>
                     <div className="flex items-center space-x-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                           s.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-white/5'
                        }`}>
                           {s.status}
                        </span>
                        <button 
                           onClick={() => enterPortal(s)}
                           className="h-12 px-6 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all opacity-0 group-hover:opacity-100 flex items-center space-x-2 shadow-lg shadow-primary/20"
                        >
                           <span>Enter Hall</span>
                           <ChevronRight className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {/* Assessment Portal Modal */}
       <AnimatePresence>
         {isPortalOpen && selectedSession && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-card glass border border-white/10 w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl p-10 flex flex-col relative overflow-hidden"
             >
               <button onClick={() => setIsPortalOpen(false)} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20">
                 <X className="h-5 w-5" />
               </button>

               <div className="flex items-center space-x-6 mb-10">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl font-black">
                   <Sparkles className="h-8 w-8" />
                 </div>
                 <div>
                   <h2 className="text-3xl font-black tracking-tighter">Assessment Hall</h2>
                   <p className="text-muted-foreground text-xs uppercase font-black tracking-widest">Candidate ID: {selectedSession.name.split(' ')[0]}-FORENSIC</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-hidden">
                 <div className="md:col-span-2 space-y-6 overflow-y-auto pr-4">
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5">
                       <h4 className="font-black uppercase tracking-widest text-[10px] text-primary mb-4">Technical Prompt</h4>
                       <p className="text-lg font-medium leading-relaxed">
                          Analyze the provided candidate's architectural decision in the repository. Verify if the implementation of the observer pattern in the event-bus module correctly avoids memory leaks during high-concurrency event bursts.
                       </p>
                    </div>
                    <div className="bg-secondary rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4 border border-border/50">
                       <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
                       <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Waiting for ritual instantiation...</p>
                    </div>
                 </div>
                 <div className="md:col-span-1 glass rounded-[2rem] p-8 flex flex-col">
                    <h4 className="font-black uppercase tracking-widest text-[10px] text-emerald-500 mb-6">Expert Calibration</h4>
                    <div className="space-y-6 flex-1">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Technical Score</label>
                          <input type="range" className="w-full accent-primary" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Integrity Check</label>
                          <div className="flex space-x-2">
                             <button className="flex-1 py-3 bg-secondary rounded-xl text-[10px] font-black border border-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">PASS</button>
                             <button className="flex-1 py-3 bg-secondary rounded-xl text-[10px] font-black border border-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors">FLAG</button>
                          </div>
                       </div>
                    </div>
                    <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20">
                       Submit Forensic Grade
                    </button>
                 </div>
               </div>

               <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -z-10" />
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}

function StatsCard({ label, val, icon: Icon, color }: any) {
  return (
    <div className="p-8 glass rounded-[2.5rem] group hover:border-primary/50 transition-all">
       <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color}`}>
          <Icon className="h-7 w-7" />
       </div>
       <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">{label}</p>
       <p className="text-4xl font-black mt-2 tracking-tighter">{val}</p>
    </div>
  );
}
