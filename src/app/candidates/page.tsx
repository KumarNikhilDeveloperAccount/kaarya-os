'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Code2, Sparkles, Filter } from 'lucide-react';
import { getProfileData } from '@/lib/store';

const MOCK_CANDIDATES = [
  {
    id: '1',
    fullName: 'Alex Chen',
    jobTitle: 'Senior Full Stack Engineer',
    location: 'Seattle, WA',
    skills: ['React', 'Node.js', 'AWS', 'GraphQL'],
    bio: 'Passionate about building scalable web applications and leading high-performing teams.',
    hireability: 98
  },
  {
    id: '2',
    fullName: 'Sarah Johnson',
    jobTitle: 'Product Designer',
    location: 'Remote',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research'],
    bio: 'Creating intuitive and beautiful digital experiences for millions of users.',
    hireability: 95
  },
  {
    id: '3',
    fullName: 'Michael Torres',
    jobTitle: 'Data Scientist',
    location: 'Austin, TX',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    bio: 'Leveraging data to drive business decisions and build predictive models.',
    hireability: 92
  }
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>(MOCK_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // If the active user has a candidate profile in localStorage, prepend it to the mock list
    const candidateProfile = getProfileData('candidate');
    if (candidateProfile && candidateProfile.fullName) {
      setCandidates([
        {
          id: 'user',
          ...candidateProfile,
          hireability: 99
        },
        ...MOCK_CANDIDATES
      ]);
    }
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Talent Pool</h1>
          <p className="text-muted-foreground mt-2">Discover pre-vetted, elite talent ready to deploy.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button className="p-2 border border-border bg-card rounded-xl hover:bg-secondary transition-colors">
             <Filter className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={candidate.id} 
            className="bg-card border border-border rounded-[2rem] p-6 hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-secondary border-2 border-background shadow-md overflow-hidden flex items-center justify-center shrink-0">
                {candidate.profilePic ? (
                  <img src={candidate.profilePic} alt={candidate.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-xl font-black">
                     {getInitials(candidate.fullName)}
                  </div>
                )}
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase tracking-widest flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                {candidate.hireability}% Score
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-black tracking-tight">{candidate.fullName}</h3>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider">{candidate.jobTitle}</p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground font-medium mb-6">
              <MapPin className="w-3 h-3" />
              <span>{candidate.location}</span>
            </div>

            <div className="mb-6 flex-1">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {candidate.bio}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border">
              {candidate.skills && candidate.skills.slice(0, 3).map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-secondary/50 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {skill}
                </span>
              ))}
              {candidate.skills && candidate.skills.length > 3 && (
                <span className="px-3 py-1 bg-secondary/50 rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  +{candidate.skills.length - 3}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
