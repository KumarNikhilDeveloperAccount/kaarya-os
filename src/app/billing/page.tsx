'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Zap, ShieldCheck, Download, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import Script from 'next/script';

const PRODUCTS = [
  { id: 'premium_access', name: 'Premium Candidate Access', price: '₹7,999/mo', amount: 7999, desc: 'Unlock unlimited candidate profiles and direct messaging.' },
  { id: 'featured_post', name: 'Featured Job Post', price: '₹2,499/post', amount: 2499, desc: 'Highlight your job post at the top of Opp Orbit for 7 days.' },
  { id: 'analytics_pro', name: 'Advanced Analytics', price: '₹14,999/mo', amount: 14999, desc: 'Deep AI insights into your hiring funnel and diversity metrics.' }
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.get('/api/ecosystem/invoices');
        setInvoices(res.data);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      }
    };
    fetchInvoices();
  }, []);

  const handleCheckout = async (item: any) => {
    if (!scriptLoaded) {
        alert("Payment gateway is still loading. Please try again in a moment.");
        return;
    }
    
    try {
        setLoading(true);
        const { api } = await import('@/lib/api');
        
        // Step 1: Create Order on Backend
        const orderRes = await api.post('/api/payments/create-order', {
            item_type: item.id,
            custom_amount: item.amount
        });
        
        const orderData = orderRes.data;
        if (!orderData || !orderData.id) throw new Error("Failed to create order");
        
        // Step 2: Initialize Razorpay
        const options = {
            key: "rzp_test_kaaryaos123456", // Test key, real one will be passed if available
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Kaarya.OS",
            description: item.name,
            image: "/kaarya-logo-final.png",
            order_id: orderData.id,
            handler: async function (response: any) {
                // Step 3: Verify Payment Signature on Backend
                try {
                    const verifyRes = await api.post('/api/payments/verify', {
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        item_type: item.id,
                        amount: item.amount
                    });
                    
                    if (verifyRes.data.status === 'success') {
                        setPurchased([...purchased, item.id]);
                        // Refresh invoices
                        const newInvoice = {
                           id: `INV-2026-${Math.floor(Math.random() * 1000)}`,
                           date: new Date().toISOString().split('T')[0],
                           amount: item.price,
                           status: 'Paid'
                        };
                        setInvoices([newInvoice, ...invoices]);
                        alert("Payment successful! Premium feature unlocked.");
                    }
                } catch (verifyError) {
                    alert("Payment verification failed. Please contact support.");
                }
            },
            prefill: {
                name: "Nikhil Kashyap",
                email: "nkashyapnikhilnk@gmail.com",
                contact: "9315600875"
            },
            theme: {
                color: "#3b82f6"
            }
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            alert("Payment failed: " + response.error.description);
        });
        rzp.open();
        
    } catch (err: any) {
        console.error('Checkout error:', err);
        alert(err.response?.data?.detail || "Checkout failed. Using mock system fallback? Configure Razorpay keys in backend.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
          <CreditCard className="h-8 w-8 mr-3 text-primary" /> Billing & Upgrades
        </h1>
        <p className="text-muted-foreground mt-2 font-medium max-w-2xl">Manage your Kaarya.OS subscription and expand your capabilities with premium add-ons.</p>
      </div>

      <div className="mb-12">
         <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Available Upgrades</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRODUCTS.map(product => {
               const isOwned = purchased.includes(product.id);
               return (
                 <div key={product.id} className="bg-card border border-border rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
                    <ShieldCheck className={`h-8 w-8 mb-6 ${isOwned ? 'text-emerald-500' : 'text-primary'}`} />
                    <h3 className="text-xl font-black tracking-tight mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6 h-10">{product.desc}</p>
                    <div className="flex items-end justify-between mt-auto">
                       <span className="text-2xl font-black">{product.price}</span>
                       <button 
                          disabled={isOwned || loading}
                          onClick={() => handleCheckout(product)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isOwned ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95'}`}
                       >
                          {isOwned ? 'Active' : loading ? 'Processing...' : 'Upgrade'}
                       </button>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Invoice History</h2>
        <div className="space-y-4">
          {invoices.map((inv, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-2xl hover:bg-secondary/30 transition-colors">
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
