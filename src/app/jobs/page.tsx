'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Sparkles, LayoutGrid, List as ListIcon } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import { getJobs, applyToJob, getProfileData, getActiveRole, hasAppliedToJob } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function JobBoard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [role, setRole] = useState('candidate');
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyForm, setApplyForm] = useState({ notice: '', salary: '', cover: '', file: null as File | null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRole(getActiveRole());
    setProfile(getProfileData('candidate'));
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.get('/api/jobs');
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs from the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (jobId: string) => {
    if (role !== 'candidate') {
      toast.error('Only candidates can apply to jobs.');
      return;
    }
    setApplyingJobId(jobId);
  };

  const submitApplication = async () => {
      if (!applyForm.file) {
          toast.error("Please attach your Resume PDF.");
          return;
      }
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('file', applyForm.file);
      formData.append('notice_period', applyForm.notice);
      formData.append('expected_salary', applyForm.salary);
      formData.append('cover_notes', applyForm.cover);
      
      try {
        const { api } = await import('@/lib/api');
        await api.post(`/api/jobs/${applyingJobId}/apply`, formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Application submitted successfully!');
        setApplyingJobId(null);
        setApplyForm({ notice: '', salary: '', cover: '', file: null });
        fetchJobs(); // Refresh
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.detail || 'Failed to apply.');
      } finally {
        setIsSubmitting(false);
      }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
            Job Board 
            <span className="ml-4 p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Discover your next high-impact role, verified by Rit.ai.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-card p-1 rounded-xl border border-border">
          <button className="p-2 bg-secondary text-primary rounded-lg transition-all shadow-sm">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-all">
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search roles, skills, or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center justify-center px-6 py-3.5 rounded-2xl bg-secondary text-foreground font-bold text-sm border border-border hover:bg-muted transition-all">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-card rounded-2xl border border-border/50" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredJobs.length > 0 ? (
               filteredJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onApply={() => handleApply(job.id)} 
                  hasApplied={(profile || user) ? hasAppliedToJob(job.id, profile?.fullName || user?.full_name) : false}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-muted-foreground text-lg">No jobs found matching your search.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Application Modal */}
      {applyingJobId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border rounded-[2rem] p-8 max-w-lg w-full shadow-2xl">
                <h3 className="text-2xl font-black mb-2 uppercase tracking-widest text-primary">Complete Application</h3>
                <p className="text-sm text-muted-foreground mb-6">Provide additional context to increase your Rit.ai match score.</p>
                
                <div className="space-y-4 mb-8">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Resume (PDF)</label>
                      <input type="file" accept="application/pdf" onChange={(e) => setApplyForm(prev => ({...prev, file: e.target.files?.[0] || null}))} className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all mt-1" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Notice Period</label>
                         <input type="text" placeholder="e.g. 30 Days" value={applyForm.notice} onChange={(e) => setApplyForm(prev => ({...prev, notice: e.target.value}))} className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all mt-1" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Expected Salary</label>
                         <input type="text" placeholder="e.g. $120k" value={applyForm.salary} onChange={(e) => setApplyForm(prev => ({...prev, salary: e.target.value}))} className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all mt-1" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Cover Notes</label>
                      <textarea placeholder="Why are you the best fit for this role?" value={applyForm.cover} onChange={(e) => setApplyForm(prev => ({...prev, cover: e.target.value}))} className="w-full h-24 resize-none bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all mt-1" />
                   </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setApplyingJobId(null)} className="flex-1 py-4 bg-secondary text-foreground font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-muted transition-colors">Cancel</button>
                   <button onClick={submitApplication} disabled={isSubmitting} className="flex-1 py-4 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                      {isSubmitting ? 'Analyzing...' : 'Submit Application'}
                   </button>
                </div>
             </motion.div>
          </div>
      )}
    </div>
  );
}
