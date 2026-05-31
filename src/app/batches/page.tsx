'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, Building, Star, Search, Filter, MoreHorizontal } from 'lucide-react';
import { api } from '@/lib/api';

const mockBatches = [
  { id: 'CS-2026', name: 'Computer Science 2026', students: 120, avgScore: 88, placed: 45, status: 'Active' },
  { id: 'IT-2026', name: 'Information Tech 2026', students: 85, avgScore: 82, placed: 30, status: 'Active' },
  { id: 'DS-2025', name: 'Data Science 2025', students: 60, avgScore: 91, placed: 58, status: 'Graduating' },
  { id: 'CS-2024', name: 'Computer Science 2024', students: 110, avgScore: 85, placed: 105, status: 'Completed' },
];

export default function BatchesPage() {
  const [batches, setBatches] = useState(mockBatches);
  const [loading, setLoading] = useState(false);

  // In a real app, we would fetch this:
  // useEffect(() => { api.get('/api/batches').then(res => setBatches(res.data)) }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
            <GraduationCap className="h-8 w-8 mr-3 text-primary" /> Batches & Cohorts
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage student directories and track graduation pipelines.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-secondary rounded-xl border border-border hover:border-primary/50 transition-all">
            <Search className="h-5 w-5" />
          </button>
          <button className="px-4 py-2 bg-secondary rounded-xl border border-border hover:border-primary/50 transition-all flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button className="px-6 py-2 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
            + New Cohort
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Batch ID & Name</th>
                <th className="px-6 py-4">Student Count</th>
                <th className="px-6 py-4">Rit.AI Avg Score</th>
                <th className="px-6 py-4">Placements</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{batch.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{batch.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{batch.students}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold">{batch.avgScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold">{batch.placed} / {batch.students}</span>
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden ml-2">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${(batch.placed / batch.students) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      batch.status === 'Active' ? 'bg-blue-500/10 text-blue-500' :
                      batch.status === 'Graduating' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
