'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Database, Lock, AlertCircle } from 'lucide-react';

export default function SalaryVault() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  
  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const res = await api.get('/api/salary');
      setSalaries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/api/salary', {
        role_name: role,
        amount: parseInt(amount),
        location: location || 'Remote'
      });
      setRole('');
      setAmount('');
      setLocation('');
      fetchSalaries();
    } catch (err) {
      console.error("Failed to submit salary data");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-primary/20 rounded-xl text-primary">
          <Database className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Salary Intelligence Vault</h1>
          <p className="text-muted-foreground font-medium text-sm flex items-center mt-1">
            <Lock className="h-3.5 w-3.5 mr-1" /> Anonymous crowdsourced compensation intelligence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-card p-6 rounded-3xl border border-border">
          <h3 className="font-bold mb-4 flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Contribute Anonymously
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Job Role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} required placeholder="e.g. Senior Frontend Engineer" className="w-full bg-secondary border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Annual Compensation (LPA or USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="150000" className="w-full bg-secondary border border-border rounded-xl p-3 pl-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore, Remote" className="w-full bg-secondary border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start space-x-3 mt-4">
              <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-200">Your contribution is 100% anonymous. It helps balance the hiring ecosystem by providing market transparency.</p>
            </div>
            <button type="submit" className="w-full py-4 mt-2 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
              Submit Anonymous Data
            </button>
          </form>
        </div>

        {/* Data Vault */}
        <div className="lg:col-span-2 bg-card p-6 rounded-3xl border border-border">
          <h3 className="font-bold mb-6 flex items-center text-lg">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Market Insights
          </h3>
          {loading ? (
             <div className="flex h-40 items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
             </div>
          ) : salaries.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Database className="h-10 w-10 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No salary data available yet. Be the first!</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salaries.map((s: any, idx: number) => (
                   <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: idx*0.05}} key={idx} className="bg-secondary/50 border border-border p-5 rounded-2xl">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{s.location}</p>
                      <h4 className="font-black text-lg mb-4 text-white truncate">{s.role_name}</h4>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Reported Comp</p>
                            <p className="text-xl font-bold text-emerald-400">₹{(s.amount || 0).toLocaleString()}</p>
                         </div>
                         <div className="px-2 py-1 bg-white/5 rounded-md border border-white/10">
                            <span className="text-[10px] text-white/50 font-bold uppercase">Verified</span>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
