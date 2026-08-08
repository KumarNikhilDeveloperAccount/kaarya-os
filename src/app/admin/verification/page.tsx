'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserCheck, Search, Filter, 
  CheckCircle2, XCircle, Clock, Sparkles, 
  FileText, ExternalLink, ShieldAlert, Building, GraduationCap
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminVerification() {
  const [activeTab, setActiveTab] = useState<'professionals' | 'entities'>('professionals');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, entitiesRes] = await Promise.all([
        axios.get('/api/admin/applications', { withCredentials: true }),
        axios.get('/api/admin/unverified-entities', { withCredentials: true })
      ]);
      
      const filtered = appsRes.data.filter((app: any) => 
        app.status === 'vetted' || app.status === 'flagged' || app.ai_score > 90
      );

      const mapped = filtered.map((app: any) => ({
        id: app.id,
        user_id: app.candidate.id,
        name: app.candidate.full_name || app.candidate.email,
        experience: "8+ Yrs", // Hardcoded placeholder for now
        domain: app.job.title,
        rit_score: app.ai_score || 0,
        ai_summary: app.ai_feedback?.summary || "No automated summary available.",
        applied_at: new Date(app.created_at).toLocaleDateString(),
        status: app.status === 'vetted' ? 'Vetted' : 'Flagged'
      }));

      setCandidates(mapped);
      setEntities(entitiesRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch verification queues");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProfessional = async (candidate: any) => {
    toast.promise(
      axios.post(`/api/admin/approve-interviewer/${candidate.user_id}`, {}, { withCredentials: true }),
      {
        loading: 'Approving professional...',
        success: (data) => {
          fetchData();
          return `${candidate.name} approved and added to live rotation.`;
        },
        error: 'Approval failed. Please check permissions.'
      }
    );
  };

  const handleVerifyEntity = async (entity: any) => {
    toast.promise(
      axios.post(`/api/admin/verify-entity/${entity.id}`, {}, { withCredentials: true }),
      {
        loading: 'Verifying entity...',
        success: (data) => {
          fetchData();
          return `${entity.name} has been verified and granted authentic status.`;
        },
        error: 'Verification failed. Please check permissions.'
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black tracking-tight flex items-center">
             Identity & Verification 
             <ShieldCheck className="ml-3 h-6 w-6 text-primary" />
           </h1>
           <p className="text-muted-foreground mt-2 font-medium">
             Admin control center for verifying Professionals, Companies, and Colleges.
           </p>
        </div>
        
        <div className="bg-primary/10 border border-primary/20 p-2 px-4 rounded-xl flex items-center space-x-2">
           <Sparkles className="h-4 w-4 text-primary" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Vetting Enabled</span>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-border pb-4">
         <button 
           onClick={() => setActiveTab('professionals')}
           className={`px-6 py-2 rounded-xl font-bold transition-all text-sm uppercase tracking-widest ${activeTab === 'professionals' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted'}`}
         >
           Professionals Queue
         </button>
         <button 
           onClick={() => setActiveTab('entities')}
           className={`px-6 py-2 rounded-xl font-bold transition-all text-sm uppercase tracking-widest flex items-center space-x-2 ${activeTab === 'entities' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-muted'}`}
         >
           <span>Entities Queue</span>
           {entities.length > 0 && (
              <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-[10px]">{entities.length}</span>
           )}
         </button>
      </div>

      {loading ? (
         <div className="flex items-center justify-center py-20 text-muted-foreground animate-pulse">Loading queue...</div>
      ) : activeTab === 'professionals' ? (
        /* Professional Verification Queue */
        <div className="grid grid-cols-1 gap-6">
          {candidates.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-secondary/30 rounded-2xl border border-dashed border-border">No professionals pending approval.</div>
          ) : candidates.map((c) => (
            <motion.div 
              key={c.id}
              whileHover={{ y: -2 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-soft flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Rit.AI</p>
                      <div className={`text-2xl font-black ${c.rit_score > 80 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {c.rit_score}%
                      </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 min-w-[300px]">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center font-black text-xl text-primary">
                      {c.name.charAt(0)}
                  </div>
                  <div>
                      <h3 className="text-lg font-bold">{c.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{c.domain} • {c.experience}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full font-bold uppercase tracking-widest">
                            {c.applied_at}
                        </span>
                        {c.status === 'Vetted' ? (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-bold uppercase tracking-widest">
                              AI Vetted
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full font-bold uppercase tracking-widest">
                              Flagged
                          </span>
                        )}
                      </div>
                  </div>
                </div>

                <div className="flex-1 bg-secondary/30 p-4 rounded-xl border border-white/5 mx-4">
                  <div className="flex items-center space-x-2 mb-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                      <Sparkles className="h-3 w-3" />
                      <span>Rit Intelligence Summary</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                      &quot;{c.ai_summary}&quot;
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none p-3 bg-secondary hover:bg-muted text-muted-foreground rounded-xl transition-all">
                      <FileText className="h-5 w-5" />
                  </button>
                  <button className="flex-1 md:flex-none p-3 bg-secondary hover:bg-muted text-muted-foreground rounded-xl transition-all">
                      <ExternalLink className="h-5 w-5" />
                  </button>
                    <button 
                      disabled={c.status === 'Flagged'}
                      onClick={() => handleApproveProfessional(c)}
                      className="flex-1 md:flex-none h-12 px-8 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                    >
                      Approve
                  </button>
                </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Entities Verification Queue */
        <div className="grid grid-cols-1 gap-6">
          {entities.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-secondary/30 rounded-2xl border border-dashed border-border">No entities pending verification.</div>
          ) : entities.map((e) => (
            <motion.div 
              key={e.id}
              whileHover={{ y: -2 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-soft flex flex-col md:flex-row gap-8 items-start md:items-center"
            >
                <div className="flex items-center space-x-6 min-w-[300px] flex-1">
                  <div className={`w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center ${e.role === 'company' ? 'text-blue-500' : 'text-purple-500'}`}>
                      {e.role === 'company' ? <Building className="h-8 w-8" /> : <GraduationCap className="h-8 w-8" />}
                  </div>
                  <div>
                      <h3 className="text-lg font-bold">{e.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{e.email}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-[10px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full font-bold uppercase tracking-widest">
                            {e.role}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full font-bold uppercase tracking-widest">
                            Pending Manual Verification
                        </span>
                      </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                  {e.resume_url ? (
                    <a 
                      href={`/api/auth/users/${e.id}/resume`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none p-3 bg-secondary hover:bg-muted text-muted-foreground rounded-xl transition-all flex items-center justify-center space-x-2"
                      title="View Registration Document"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">View Doc</span>
                    </a>
                  ) : (
                    <div className="text-xs text-red-500 italic px-4">No Doc Uploaded</div>
                  )}
                    <button 
                      onClick={() => handleVerifyEntity(e)}
                      className="flex-1 md:flex-none h-12 px-8 bg-emerald-500 text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Grant Blue Tick
                  </button>
                </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="p-10 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
         <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mb-4" />
         <h4 className="font-bold text-muted-foreground">Compliance Oversight</h4>
         <p className="max-w-md text-xs text-muted-foreground mt-1">
            Approving a professional grants them access to platform revenue. Verifying a company or college gives them platform-wide authenticity badges.
         </p>
      </div>
    </div>
  );
}
