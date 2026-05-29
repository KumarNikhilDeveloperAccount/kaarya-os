import { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, Building, BarChart3, TrendingUp, Sparkles, 
  Plus, Search, Download, ChevronRight, CheckCircle2, UserCheck, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CollegeDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/dashboard/college');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to sync institutional matrix');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
     <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
  );

  const dashStats = [
    { label: 'Total Students', val: data?.stats?.total_students || '0', icon: Users, color: 'text-primary' },
    { label: 'Placements', val: data?.stats?.placements || '0%', icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Avg Package', val: data?.stats?.avg_package || '₹0L', icon: TrendingUp, color: 'text-amber-500' }
  ];

  const batches = data?.batches || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-600">Institutional Hub</h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium tracking-tight">Managing <span className="text-foreground font-bold">{data?.stats?.total_students || 0} scholars</span>. Placement integrity: <span className="text-emerald-500 font-bold">{data?.stats?.placements || '0%'}</span>.</p>
         </div>
         <div className="flex space-x-3">
            <button className="h-12 bg-secondary/50 border border-white/5 text-foreground px-6 rounded-2xl font-black flex items-center space-x-3 hover:bg-muted transition-all text-[10px] uppercase tracking-widest">
               <Download className="h-4 w-4" />
               <span>Export Analytics</span>
            </button>
            <button className="h-12 bg-primary text-white px-6 rounded-2xl font-black flex items-center space-x-3 shadow-2xl shadow-primary/20 hover:scale-[1.05] transition-all text-[10px] uppercase tracking-widest">
               <Plus className="h-4 w-4" />
               <span>Onboard Batch</span>
            </button>
         </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {dashStats.map((s, i) => (
           <motion.div 
             key={s.label}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-8 glass rounded-[2.5rem] group hover:border-primary/50 transition-all"
           >
              <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${s.color}`}>
                 <s.icon className="h-7 w-7" />
              </div>
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">{s.label}</p>
              <p className="text-4xl font-black mt-2 tracking-tighter">{s.val}</p>
           </motion.div>
         ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-[3rem] overflow-hidden">
               <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="font-black uppercase tracking-tighter text-xl flex items-center">
                     <GraduationCap className="h-6 w-6 mr-3 text-primary" />
                     Scholastic Roster
                  </h3>
               </div>
               <div className="divide-y divide-border">
                  {batches.map((b: any) => (
                    <div key={b.name} className="p-6 hover:bg-white/5 transition-all group cursor-pointer border-l-4 border-transparent hover:border-primary">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-6">
                             <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary font-black shadow-inner">
                                {b.name.charAt(0)}
                             </div>
                             <div>
                                <p className="text-lg font-bold tracking-tight">{b.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{b.total} Active Scholars</p>
                             </div>
                          </div>
                          <div className="flex items-center space-x-12">
                             <div className="text-right">
                                <p className="text-xl font-black text-primary text-glow">{Math.round((b.placed / b.total) * 100)}% Verified</p>
                                <div className="w-40 h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${(b.placed / b.total) * 100}%` }}
                                     className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                   />
                                </div>
                             </div>
                             <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full p-6 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors text-center border-t border-white/5">
                  Access Full Digital Credentials Database
               </button>
            </div>
         </div>


         <div className="lg:col-span-1">
            <div className="glass border border-white/5 rounded-[3rem] p-10 h-full flex flex-col relative overflow-hidden">
               {/* Accent Gradient */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10" />
               
               <div className="flex items-center space-x-4 text-purple-500 mb-8">
                  <BarChart3 className="h-7 w-7" />
                  <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">AI Insight Center</h4>
               </div>
               <p className="text-base text-muted-foreground leading-relaxed mb-10 font-medium">
                  "Scholars in <span className="text-foreground">Computer Science 2026</span> demonstrate superior forensic accuracy in distributed systems. Recommended: specialized engineering simulation injection."
               </p>
               <div className="space-y-4">
                  <div className="p-5 glass rounded-[1.5rem] border border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest">Growth Velocity</span>
                     <span className="text-emerald-500 font-extrabold text-xs">+12% WoW</span>
                  </div>
                  <div className="p-5 glass rounded-[1.5rem] border border-white/5 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest">Primary Partner</span>
                     <span className="text-primary font-extrabold text-xs">Anthropic</span>
                  </div>
                </div>
               <button className="mt-auto w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-purple-500/20 hover:scale-[1.03] active:scale-95 transition-all">
                  Review Growth Plan
               </button>
            </div>
         </div>

      </div>
    </div>
  );
}
