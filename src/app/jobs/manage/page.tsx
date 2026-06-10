'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, Plus, MapPin, Search, Activity, Users, Send } from 'lucide-react';
import { getProfileData, getActiveRole } from '@/lib/store';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ManageJobsPage() {
  const [role, setRole] = useState('candidate');
  const [profile, setProfile] = useState<any>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const { user } = useAuth();
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  
  const [isPosting, setIsPosting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary_range: ''
  });

  useEffect(() => {
    const activeRole = getActiveRole();
    setRole(activeRole);
    if (activeRole === 'company') {
      const data = getProfileData('company');
      setProfile(data);
    }
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    try {
      if (!user) return;
      const jobsRes = await api.get('/api/jobs');
      const appsRes = await api.get('/api/jobs/applications');
      setApplications(appsRes.data);
      
      const myCreatedJobs = jobsRes.data.filter((j: any) => j.company_id === user.id);
      setMyJobs(myCreatedJobs);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostJob = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required.');
      return;
    }
    
    try {
      await api.post('/api/jobs', formData);
      toast.success('Job posted successfully!');
      setFormData({ title: '', description: '', location: '', salary_range: '' });
      setIsPosting(false);
      refreshData();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to post job');
    }
  };

  if (role !== 'company') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center space-y-6">
        <Building2 className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
        <h1 className="text-3xl font-black uppercase tracking-tight">Access Restricted</h1>
        <p className="text-muted-foreground">Only organizations can post and manage jobs. Please switch your persona to Company.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Job Control Center</h1>
          <p className="text-muted-foreground mt-2">Create, monitor, and manage your talent pipelines.</p>
        </div>
        <button 
          onClick={() => setIsPosting(!isPosting)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
           {isPosting ? 'Cancel' : <><Plus className="h-4 w-4" /> <span>Post New Job</span></>}
        </button>
      </div>

      {isPosting && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
           <h3 className="text-xl font-black uppercase tracking-tight mb-6">Deploy New Requirement</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Title</label>
                 <input 
                   value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                   placeholder="e.g. Senior Backend Engineer"
                   className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
                 <input 
                   value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                   placeholder="e.g. Remote / New York"
                   className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all" 
                 />
              </div>
              <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Salary Range</label>
                 <input 
                   value={formData.salary_range} onChange={e => setFormData({...formData, salary_range: e.target.value})}
                   placeholder="e.g. $120k - $150k"
                   className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all" 
                 />
              </div>
              <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Job Description</label>
                 <textarea 
                   value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                   placeholder="Detail the responsibilities and requirements..."
                   className="w-full h-32 bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none" 
                 />
              </div>
           </div>
           <button 
             onClick={handlePostJob}
             className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
           >
              <Send className="h-4 w-4" /> <span>Publish Job</span>
           </button>
        </motion.div>
      )}

      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground flex items-center">
           <Activity className="h-5 w-5 mr-2" /> Active Postings
        </h3>
        
        {myJobs.length === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-[2rem] text-center bg-card/50">
             <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
             <p className="text-muted-foreground font-medium">You haven't posted any jobs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {myJobs.map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id);
                return (
                  <div key={job.id} className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <h4 className="text-xl font-black tracking-tight uppercase">{job.title}</h4>
                           <p className="text-xs font-bold text-primary tracking-widest mt-1 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" /> {job.location || 'Remote'}
                           </p>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                           Live
                        </div>
                     </div>
                     <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                     
                     <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm font-bold text-muted-foreground">
                           <Users className="h-4 w-4" />
                           <span>{jobApps.length} Applications</span>
                        </div>
                        <button 
                          onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                        >
                           {expandedJobId === job.id ? 'Hide Pipeline' : 'View Pipeline'}
                        </button>
                     </div>

                     {expandedJobId === job.id && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-border space-y-4 overflow-hidden">
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Applicant Pipeline</h5>
                         {jobApps.length === 0 ? (
                           <p className="text-xs text-muted-foreground italic">No applications yet.</p>
                         ) : (
                           jobApps.map((app: any) => (
                             <div key={app.id} className="p-4 bg-secondary/50 border border-border rounded-xl flex items-center justify-between shadow-sm">
                               <div>
                                  <p className="text-sm font-bold uppercase tracking-tight">Candidate Profile #{app.candidate_id}</p>
                                  <div className="flex items-center space-x-2 mt-1 text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-emerald-500">Rit Match: {app.ai_score}%</span>
                                    <span className="text-muted-foreground">• Status: {app.status}</span>
                                  </div>
                                  <div className="mt-3 text-xs text-muted-foreground space-y-1">
                                    {app.notice_period && <p><strong className="text-foreground">Notice Period:</strong> {app.notice_period}</p>}
                                    {app.expected_salary && <p><strong className="text-foreground">Expected Salary:</strong> {app.expected_salary}</p>}
                                    {app.cover_notes && <p><strong className="text-foreground">Notes:</strong> {app.cover_notes}</p>}
                                  </div>
                               </div>
                               <button 
                                  onClick={async () => {
                                     try {
                                        const token = localStorage.getItem('token');
                                        const { api } = await import('@/lib/api');
                                        const response = await api.get(`/api/auth/users/${app.candidate_id}/resume`, { responseType: 'blob' });
                                        const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                        window.open(blobUrl, '_blank');
                                     } catch (e) {
                                        toast.error('Resume access denied or missing.');
                                     }
                                  }}
                                  className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all shadow-sm"
                               >
                                 Review AI Profile
                               </button>
                             </div>
                           ))
                         )}
                       </motion.div>
                     )}
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
}
