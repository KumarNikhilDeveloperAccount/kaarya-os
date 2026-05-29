'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, ArrowUpRight, ArrowDownRight, Search, 
  Filter, MoreHorizontal, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState<any>({ total_revenue: 0, platform_cut: 0, count: 0 });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/admin/monitoring/transactions', {
        withCredentials: true
      });
      
      const mapped = response.data.transactions.map((tx: any) => ({
        id: `tx_${tx.id}`,
        user: tx.user_id, // In a real app, join with user table for names
        amount: tx.amount,
        type: tx.item_type || 'unknown',
        status: tx.status,
        date: new Date(tx.created_at).toLocaleDateString()
      }));
      
      setTransactions(mapped);
      setMetrics(response.data.metrics);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (txId: string) => {
    const rawId = txId.replace('tx_', '');
    toast.promise(
      axios.post(`http://localhost:8000/api/admin/refund/${rawId}`, {}, { withCredentials: true }),
      {
        loading: 'Processing manual refund...',
        success: (data) => {
          fetchTransactions();
          return `Refund processed successfully.`;
        },
        error: 'Refund failed. Please check permissions.'
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Financial Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Revenue', value: `₹${metrics.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
           { label: 'Platform 20% Cut', value: `₹${metrics.platform_cut.toLocaleString()}`, icon: ArrowUpRight, color: 'text-primary' },
           { label: 'Interviewer Payouts', value: `₹${(metrics.total_revenue - metrics.platform_cut).toLocaleString()}`, icon: ArrowDownRight, color: 'text-amber-500' }
         ].map((stat, i) => (
           <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-soft">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-2.5 rounded-xl bg-secondary ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">+12% this month</span>
              </div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{stat.value}</p>
           </div>
         ))}
      </div>

      {/* Transaction Feed */}
      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
           <div>
              <h2 className="text-xl font-bold tracking-tight">Revenue Oversight Feed</h2>
              <p className="text-xs text-muted-foreground mt-1 tracking-tight italic">
                Strict business transparency monitoring.
              </p>
           </div>
           
           <div className="flex items-center space-x-3">
              <button 
                onClick={fetchTransactions}
                className="p-2.5 bg-secondary hover:bg-muted text-muted-foreground rounded-xl transition-all"
              >
                 <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                   disabled
                   type="text" 
                   placeholder="Search transactions..." 
                   className="bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-primary outline-none transition-all opacity-50 cursor-not-allowed"
                 />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-secondary/30 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Payer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Item Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Control</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                 {transactions.map((tx) => (
                    <motion.tr 
                      key={tx.id} 
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className="group transition-colors"
                    >
                       <td className="px-6 py-5 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                          {tx.id}
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap font-bold">
                          {tx.user}
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap font-black">
                          ₹{tx.amount.toLocaleString()}
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap text-xs capitalize text-muted-foreground">
                          {tx.type.replace('_', ' ')}
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                            tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                            tx.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                          }`}>
                             {tx.status}
                          </span>
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap text-xs text-muted-foreground">
                          {tx.date}
                       </td>
                       <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                             <button 
                               onClick={() => handleRefund(tx.id)}
                               className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[10px] font-bold uppercase transition-all"
                             >
                                Refund
                             </button>
                             <button className="p-2 hover:bg-secondary rounded-lg transition-all text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
