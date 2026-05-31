'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Download, ExternalLink, Zap } from 'lucide-react';
import { api } from '@/lib/api';

const mockInvoices = [
  { id: 'INV-2026-001', date: '2026-05-01', amount: '$499.00', status: 'Paid' },
  { id: 'INV-2026-002', date: '2026-04-01', amount: '$499.00', status: 'Paid' },
  { id: 'INV-2026-003', date: '2026-03-01', amount: '$499.00', status: 'Paid' },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState({ name: 'Enterprise Core', price: '$499/mo', billing_cycle: 'Monthly' });

  // In a real app, fetch from backend/Stripe:
  // useEffect(() => { api.get('/api/payments/status').then(res => setPlan(res.data)) }, [])

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
            <CreditCard className="h-8 w-8 mr-3 text-primary" /> Billing & Usage
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage your Kaarya.OS subscription and payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Current Plan</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-primary/20 text-primary rounded-2xl">
              <Zap className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black">{plan.name}</h3>
              <p className="text-muted-foreground font-medium">{plan.price} &bull; {plan.billing_cycle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-emerald-500 mb-8 text-sm font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Active & in good standing</span>
          </div>
          <button className="w-full py-3 bg-secondary border border-border rounded-xl font-black text-xs uppercase tracking-widest hover:border-primary/50 transition-all">
            Manage Subscription via Stripe
          </button>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Payment Method</h2>
          <div className="p-4 border border-border rounded-2xl bg-secondary/50 flex items-center justify-between mb-6">
             <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white font-black text-xs italic tracking-tighter">VISA</div>
                <div>
                  <p className="font-bold text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/28</p>
                </div>
             </div>
          </div>
          <button className="w-full py-3 bg-transparent text-primary border border-primary/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all">
            Update Payment Method
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Invoice History</h2>
        <div className="space-y-4">
          {invoices.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-4 border border-border rounded-2xl hover:bg-secondary/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-secondary rounded-xl">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold">{inv.amount}</p>
                  <p className="text-xs text-muted-foreground">{inv.date} &bull; {inv.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {inv.status}
                </span>
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
