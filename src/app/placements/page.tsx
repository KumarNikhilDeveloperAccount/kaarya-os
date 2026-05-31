'use client';

import { useState } from 'react';
import { Target, Search, Filter, MoreHorizontal, Briefcase, Plus, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_STAGES = [
  { id: 'sourced', title: 'Sourced', count: 12 },
  { id: 'assessing', title: 'AI Assessment', count: 8 },
  { id: 'interview', title: 'Interviewing', count: 5 },
  { id: 'offer', title: 'Offer Extended', count: 2 },
  { id: 'hired', title: 'Hired', count: 14 }
];

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alex Rivera', role: 'Frontend Engineer', stage: 'interview', score: 92, match: 'High' },
  { id: 2, name: 'Sarah Chen', role: 'Backend Engineer', stage: 'assessing', score: null, match: 'Medium' },
  { id: 3, name: 'Jordan Lee', role: 'DevOps Engineer', stage: 'offer', score: 95, match: 'High' },
  { id: 4, name: 'Priya Patel', role: 'Data Scientist', stage: 'hired', score: 88, match: 'High' },
];

export default function PlacementsPage() {
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
            <Target className="h-8 w-8 mr-3 text-primary" /> Placements Pipeline
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Track candidates from sourcing through to final offer.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-secondary rounded-xl border border-border hover:border-primary/50 transition-all flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button className="px-6 py-2 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Add Candidate
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
        {MOCK_STAGES.map((stage) => (
          <div key={stage.id} className="min-w-[320px] w-[320px] flex-shrink-0 snap-start flex flex-col h-[calc(100vh-250px)]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center">
                {stage.title} <span className="ml-2 px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-[10px]">{stage.count}</span>
              </h2>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 bg-secondary/30 border border-border/50 rounded-3xl p-3 overflow-y-auto space-y-3">
              {candidates.filter(c => c.stage === stage.id).map(candidate => (
                <motion.div 
                  layoutId={`candidate-${candidate.id}`}
                  key={candidate.id}
                  className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <UserCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{candidate.name}</h3>
                        <p className="text-xs text-muted-foreground">{candidate.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
                    <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span>{candidate.match} Match</span>
                    </div>
                    {candidate.score && (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-md">
                        {candidate.score} AI Score
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
