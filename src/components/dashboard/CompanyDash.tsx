import { useState, useEffect } from 'react';
import { 
  Building, Users, Briefcase, Zap, TrendingUp, Sparkles, 
  ArrowRight, Search, Filter, Plus, ChevronRight, BarChart3,
  CreditCard, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';

// Helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CompanyDashboard() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', description: '', location: '', salary_range: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      const res = await api.get('/api/dashboard/company');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to sync hiring intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: number, status: string) => {
    try {
      await api.patch(`/api/jobs/applications/${appId}/status`, { status });
      toast.success(`Candidate status updated to ${status}`);
      setIsReportOpen(false);
      fetchDashData();
    } catch (err) {
      toast.error('Failed to update candidate status');
    }
  };

  const openReport = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsReportOpen(true);
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setIsPurchasing(false);
      return;
    }

    try {
      // 1. Hit our backend to create a secure Razorpay order based on Pricing table
      const orderRes = await api.post('/api/payments/create-order', {
        item_type: 'hire_standard_entry'
      });
      
      const order = orderRes.data;

      // If backend is in mock mode due to missing keys, bypass Razorpay UI
      if (order.id.startsWith("order_mock_")) {
          await api.post('/api/payments/verify', {
              order_id: order.id,
              payment_id: "pay_mock_123456",
              signature: "mock_signature",
              item_type: 'hire_standard_entry',
              amount: order.amount / 100
          });
          toast.success('Mock Transaction Successful. Candidate Unlocked.');
          setIsPurchasing(false);
          return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: order.amount,
        currency: order.currency,
        name: 'Kaarya.OS',
        description: 'Elite Candidate Unlock & Interview Validation',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature Backend
            await api.post('/api/payments/verify', {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              item_type: 'hire_standard_entry',
              amount: order.amount / 100 // storing float
            });
            toast.success('Transaction Successful. Candidate Unlocked.');
          } catch (verifyErr) {
            toast.error('Payment Verification Failed (Security Breach detected)');
          }
        },
        prefill: {
          name: 'Hiring Manager',
          email: 'admin@company.com',
        },
        theme: {
          color: '#3B82F6', // Primary color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error('Failed to initiate payment. Contact support.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) return (
     <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
  );

  const candidates = data?.recent_candidates || [];
  const stats = data?.stats || {};
  const dashStats = [
    { label: 'Active Requisitions', val: stats.active_jobs || 0, icon: Briefcase, color: 'text-primary' },
    { label: 'New Applicants', val: stats.new_applicants || 0, icon: Users, color: 'text-indigo-500' },
    { label: 'Hiring Velocity', val: stats.hiring_speed || '-', icon: Zap, color: 'text-amber-500' }
  ];

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/jobs/', newJob);
      toast.success('Requisition broadcasted successfully.');
      setIsModalOpen(false);
      fetchDashData();
    } catch (err) {
      toast.error('Failed to create requisition');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div className="relative">
            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-indigo-500">Hiring Console</h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Your decision engine is calibrated. <span className="text-secondary-foreground font-bold">{candidates.length} candidates</span> ready for review.</p>
         </div>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="h-14 bg-primary text-white px-8 rounded-2xl font-black flex items-center space-x-3 shadow-2xl shadow-primary/40 hover:scale-[1.05] active:scale-95 transition-all group"
         >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="uppercase tracking-widest text-xs">Create Requisition</span>
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-1 space-y-6">
            {dashStats.map((s: any, i: number) => (
              <motion.div 
                key={s.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 glass rounded-[2.5rem] group hover:border-primary/50 transition-all"
              >
                 <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${s.color}`}>
                    <s.icon className="h-7 w-7" />
                 </div>
                 <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">{s.label}</p>
                 <p className="text-4xl font-black mt-2 tracking-tighter">{s.val}</p>
              </motion.div>
            ))}
         </div>

         <div className="lg:col-span-3 glass rounded-[3rem] p-8 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <TrendingUp className="h-64 w-64" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center space-x-3 text-primary mb-6">
                  <BarChart3 className="h-6 w-6" />
                  <h3 className="font-extrabold uppercase tracking-widest text-xs">Recruitment Pulse</h3>
               </div>
               <RecruitmentPulse />
               <div className="mt-8 grid grid-cols-3 gap-8">
                  <div>
                     <p className="text-3xl font-black text-glow">92%</p>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Candidate Integrity</p>
                  </div>
                  <div>
                     <p className="text-3xl font-black text-glow">14.2</p>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Average Rit.ai Score</p>
                  </div>
                  <div>
                     <p className="text-3xl font-black text-glow">3.1h</p>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Time to Forensic</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-[3rem] overflow-hidden">
               <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="font-black uppercase tracking-tighter text-xl flex items-center">
                     <Users className="h-6 w-6 mr-3 text-primary" />
                     Elite Talent Pool
                  </h3>

                  <div className="flex space-x-2">
                     <div className="p-2 bg-secondary rounded-lg cursor-pointer hover:bg-muted"><Search className="h-4 w-4" /></div>
                     <div className="p-2 bg-secondary rounded-lg cursor-pointer hover:bg-muted"><Filter className="h-4 w-4" /></div>
                  </div>
               </div>
               <div className="divide-y divide-border">
                  {candidates.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                       <Sparkles className="h-8 w-8 mx-auto mb-4 opacity-20" />
                       <p className="text-sm">No candidates have accessed your portal yet.</p>
                    </div>
                  ) : candidates.map((c: any) => (
                    <div 
                      key={c.id} 
                      onClick={() => openReport(c)}
                      className="p-6 hover:bg-white/5 transition-all flex items-center justify-between group cursor-pointer border-l-4 border-transparent hover:border-primary"
                    >
                       <div className="flex items-center space-x-6">
                          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary font-black text-xl shadow-inner">{c.name.charAt(0)}</div>
                          <div>
                             <p className="text-lg font-bold tracking-tight">{c.name}</p>
                             <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{c.role}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-12">
                          <div className="text-right hidden sm:block">
                             <p className="text-2xl font-black text-emerald-500 text-glow">{c.score}%</p>
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Match Strength</p>
                          </div>
                          <div className="flex items-center space-x-4">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                               c.status === 'hired' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                               c.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                               'bg-secondary text-muted-foreground border-white/5'
                             }`}>
                                {c.status}
                             </span>
                             <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-5 w-5" />
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full p-4 text-xs font-bold text-primary hover:bg-primary/5 transition-colors text-center border-t border-border">
                  View Comprehensive Talent Pool
               </button>
            </div>
         </div>

         <div className="lg:col-span-1 border border-primary/20 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-3xl p-8 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 scale-150 opacity-10 blur-xl pointer-events-none text-primary">
               <Zap className="h-32 w-32" />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex items-center space-x-3 text-primary">
                  <CreditCard className="h-6 w-6" />
                  <h4 className="font-bold uppercase tracking-widest text-[10px]">Secure Gateway</h4>
               </div>
               <div className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black tracking-widest uppercase">
                  Razorpay Active
               </div>
            </div>

            <h3 className="text-2xl font-black tracking-tight mb-2 relative z-10">Elite Validation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 relative z-10">
               Purchase rigorous AI assessments and technical interviews to validate your short-listed candidates instantly without overhead.
            </p>
            
            <div className="mt-auto flex flex-col space-y-3 relative z-10">
               <div className="p-4 bg-background border border-border rounded-xl mb-4">
                 <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Standard Entry Hire</p>
                 <p className="text-2xl font-black">₹499<span className="text-sm text-muted-foreground font-medium">/candidate</span></p>
               </div>
               
               <button 
                 onClick={handlePurchase}
                 disabled={isPurchasing}
                 className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2 disabled:opacity-50"
               >
                  {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> <span>Purchase Analysis</span></>}
               </button>
            </div>
         </div>
      </div>
      {/* Job Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3 text-primary mb-6">
                 <Briefcase className="h-6 w-6" />
                 <h2 className="text-2xl font-black uppercase tracking-tighter">New Requisition</h2>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Job Title</label>
                  <input 
                    required 
                    value={newJob.title} 
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g. Senior Architecture Lead"
                    className="w-full bg-secondary border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea 
                    required 
                    rows={4}
                    value={newJob.description} 
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Detail the technical stack and core responsibilities..."
                    className="w-full bg-secondary border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</label>
                    <input 
                      value={newJob.location} 
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      placeholder="Remote / HQ"
                      className="w-full bg-secondary border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Salary Range</label>
                    <input 
                      value={newJob.salary_range} 
                      onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                      placeholder="₹20L - ₹35L"
                      className="w-full bg-secondary border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Broadcast Requisition</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Candidate Vetting Report Modal */}
      <AnimatePresence>
        {isReportOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-card glass border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] p-10 relative overflow-hidden"
            >
              <button onClick={() => setIsReportOpen(false)} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20">
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-black shadow-lg">
                      {selectedCandidate.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter">{selectedCandidate.name}</h2>
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-[11px] mt-1">{selectedCandidate.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-black text-primary text-glow">{selectedCandidate.score}%</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Match Integrity</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                    <h4 className="text-[10px] uppercase font-black tracking-[0.2em] mb-4 text-emerald-500">Forensic Assets</h4>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span>Technical Proficiency</span>
                          <span className="text-emerald-500 font-extrabold">9.4/10</span>
                       </div>
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span>Adaptive IQ</span>
                          <span className="text-emerald-500 font-extrabold">8.8/10</span>
                       </div>
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span>Communication Clarity</span>
                          <span className="text-emerald-500 font-extrabold">9.1/10</span>
                       </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                    <h4 className="text-[10px] uppercase font-black tracking-[0.2em] mb-4 text-blue-500">AI Trust Indicators</h4>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span>Verification History</span>
                          <span className="text-blue-500">Positive</span>
                       </div>
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span>Plagiarism Risk</span>
                          <span className="text-emerald-500">Zero</span>
                       </div>
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span>Culture Alignment</span>
                          <span className="text-blue-500">92%</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    onClick={() => handleUpdateStatus(selectedCandidate.id, 'hired')}
                    className="flex-1 h-16 bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.03] transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Extend Offer</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedCandidate.id, 'rejected')}
                    className="flex-1 h-16 bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border border-white/5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Archive Identity
                  </button>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecruitmentPulse() {
  return (
    <div className="w-full h-24 flex items-end justify-between space-x-1">
      {[...Array(24)].map((_, i) => (
        <motion.div
           key={i}
           initial={{ height: 10 }}
           animate={{ height: Math.random() * 80 + 20 }}
           transition={{ duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: i * 0.1 }}
           className="flex-1 bg-primary/40 rounded-t-sm"
        />
      ))}
    </div>
  );
}
