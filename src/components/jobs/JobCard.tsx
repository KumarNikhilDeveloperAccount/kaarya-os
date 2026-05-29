import React from 'react';
import { MapPin, IndianRupee, Clock, ArrowRight, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    salary_range: string;
    created_at: string;
    company: {
      full_name: string;
    };
  };
  onApply: (id: number) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
            <p className="text-xs text-muted-foreground font-medium">{job.company.full_name}</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-1 bg-green-500/10 text-green-500 rounded-full font-bold uppercase tracking-wider">
          Open
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
        {job.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mr-2 text-primary/60" />
          {job.location}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5 mr-2 text-primary/60" />
          {job.salary_range}
        </div>
        <div className="flex items-center text-xs text-muted-foreground col-span-2">
          <Clock className="h-3.5 w-3.5 mr-2 text-primary/60" />
          Posted {new Date(job.created_at).toLocaleDateString()}
        </div>
      </div>

      <button 
        onClick={() => onApply(job.id)}
        className="w-full flex items-center justify-center py-2.5 rounded-xl bg-secondary text-foreground font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 group/btn"
      >
        View & Apply 
        <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
