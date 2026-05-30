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

  useEffect(() => {
    setRole(getActiveRole());
    setProfile(getProfileData('candidate'));
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const localJobs = getJobs();
      const fallbackJobs = [
        {
          id: 'fb1',
          title: "Senior AI Backend Engineer",
          description: "We are looking for a Python expert with Experience in FastAPI and Vertex AI to build Rit.ai infrastructure.",
          location: "Remote / Hyderabad",
          salary_range: "₹40L - ₹60L",
          created_at: new Date().toISOString(),
          company: { companyName: "Google Recruitment", logo: null }
        },
        {
          id: 'fb2',
          title: "Fullstack Product Designer",
          description: "Join our team to build premium, dark-mode first dashboards for Kaarya.OS. Proficiency in Tailwind and Framer Motion required.",
          location: "Bangalore",
          salary_range: "₹25L - ₹35L",
          created_at: new Date().toISOString(),
          company: { companyName: "Kaarya Labs", logo: null }
        }
      ];
      setJobs([...localJobs, ...fallbackJobs]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (jobId: string) => {
    if (role !== 'candidate') {
      toast.error('Only candidates can apply to jobs.');
      return;
    }
    const candidateName = profile?.fullName || user?.full_name;
    if (!candidateName) {
      toast.error('Please complete your candidate profile first.');
      return;
    }
    
    if (hasAppliedToJob(jobId, candidateName)) {
      toast.info('You have already applied to this job.');
      return;
    }

    const applicationProfile = profile || { fullName: candidateName, email: user?.email };
    applyToJob(jobId, applicationProfile);
    toast.success('Application submitted successfully!');
    // Trigger re-render to update UI (JobCard will need to check applied status)
    fetchJobs();
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
    </div>
  );
}
