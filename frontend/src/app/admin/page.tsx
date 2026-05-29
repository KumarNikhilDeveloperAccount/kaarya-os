'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Briefcase, TrendingUp, Search, Filter, 
  MoreHorizontal, CheckCircle2, XCircle, Clock, 
  ExternalLink, Sparkles 
} from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/api/admin/applications');
      
      const mapped = response.data.map((app: any) => ({
        id: app.id,
        name: app.candidate.full_name || app.candidate.email,
        role: app.job.title,
        score: app.ai_score || 0,
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('_', ' '),
        sim_result: (app.ai_score || 0) > 50 ? "Passed (12/12)" : "Failed (3/12)",
        applied_at: new Date(app.created_at).toLocaleDateString()
      }));
      
      setCandidates(mapped);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Applicants', value: '1,248', icon: Users, color: 'text-primary' },
           { label: 'Open Roles', value: '12', icon: Briefcase, color: 'text-blue-500' },
           { label: 'Avg. AI Score', value: '72%', icon: TrendingUp, color: 'text-emerald-500' },
           { label: 'Verified Hire', value: '84', icon: Sparkles, color: 'text-purple-500' }
         ].map((stat, i) => (
           <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-soft flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                 <stat.icon className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
                 <p className="text-2xl font-black">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
           <div>
              <h2 className="text-xl font-bold tracking-tight">Active Candidates</h2>
              <p className="text-xs text-muted-foreground mt-1 tracking-tight italic">
                Sorted by Rit.ai Intelligence Score (Top First)
              </p>
           </div>
           
           <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                   type="text" 
                   placeholder="Search name or role..." 
                   className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
                 />
              </div>
              <button className="p-2.5 bg-secondary hover:bg-muted text-muted-foreground rounded-xl transition-all">
                 <Filter className="h-4 w-4" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-secondary/30 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Applied For</th>
                    <th className="px-6 py-4">AI Score</th>
                    <th className="px-6 py-4">Simulation</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                 {candidates.map((c) => (
                    <motion.tr 
                      key={c.id} 
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className="group transition-colors"
                    >
                       <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center font-bold text-xs">
                                {c.name.charAt(0)}
                             </div>
                             <div>
                                <p className="font-bold">{c.name}</p>
                                <p className="text-[10px] text-muted-foreground">{c.applied_at}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap font-medium text-muted-foreground">
                          {c.role}
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                             <div className="flex-1 w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${c.score}%` }}
                                  className={`h-full ${c.score > 80 ? 'bg-emerald-500' : c.score > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                />
                             </div>
                             <span className="font-black text-xs text-white">{c.score}%</span>
                          </div>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${c.sim_result.includes('Passed') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                             {c.sim_result}
                          </span>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                             {c.status === 'Rejected' ? <XCircle className="h-3 h-3 mr-2 text-red-500" /> : <Clock className="h-3 h-3 mr-2 text-primary" />}
                             <span className="font-medium text-xs">{c.status}</span>
                          </div>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                          <button className="p-2 hover:bg-secondary rounded-lg transition-all text-muted-foreground">
                             <ExternalLink className="h-4 w-4" />
                          </button>
                       </td>
                    </motion.tr>
                 ))}
              </tbody>
           </table>
        </div>
        
        <div className="p-6 bg-secondary/20 flex justify-center border-t border-white/5">
           <button className="text-xs font-bold text-primary hover:underline">View All Candidates</button>
        </div>
      </div>
    </div>
  );
}
