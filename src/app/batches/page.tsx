'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, Building, Star, Search, Filter, MoreHorizontal } from 'lucide-react';
import { api } from '@/lib/api';

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newBatch, setNewBatch] = useState({ id: '', name: '', students: 0, avgScore: 0, placed: 0, status: 'Active' });

  const handleCreateBatch = async () => {
    try {
      const { api } = await import('@/lib/api');
      const res = await api.post('/api/ecosystem/batches', newBatch);
      setBatches([res.data, ...batches]);
      setShowModal(false);
      setNewBatch({ id: '', name: '', students: 0, avgScore: 0, placed: 0, status: 'Active' });
    } catch (err) {
      console.error('Failed to create batch', err);
    }
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.get('/api/ecosystem/batches');
        setBatches(res.data);
      } catch (err) {
        console.error('Failed to fetch batches:', err);
      }
    };
    fetchBatches();
  }, []);

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
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
            + New Cohort
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-foreground">Create New Cohort</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Batch ID</label>
                <input 
                  value={newBatch.id} onChange={e => setNewBatch({...newBatch, id: e.target.value})}
                  placeholder="e.g. CS-2027"
                  className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all mt-1" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Batch Name</label>
                <input 
                  value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})}
                  placeholder="e.g. Computer Science 2027"
                  className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all mt-1" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Student Count</label>
                <input 
                  type="number"
                  value={newBatch.students} onChange={e => setNewBatch({...newBatch, students: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all mt-1" 
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateBatch}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

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
