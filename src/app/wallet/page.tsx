'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, ArrowRight, Loader2, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('1000');
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        setIsLoading(false);
        return;
      }

      // Create order
      const orderRes = await api.post('/api/payment/create-order', {
        amount: Number(amount) * 100, // in paisa
        currency: 'INR'
      });

      const { order_id, amount: orderAmount } = orderRes.data;

      if (order_id && order_id.startsWith("order_mock_")) {
          await api.post('/api/payment/verify', {
            razorpay_order_id: order_id,
            razorpay_payment_id: "pay_mock_123456",
            razorpay_signature: "mock_signature"
          });
          toast.success('Mock Payment Successful! Funds added to wallet.');
          setIsLoading(false);
          return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SXSIL5pBjkGpta',
        amount: orderAmount,
        currency: 'INR',
        name: 'Kaarya.OS',
        description: 'Wallet Deposit',
        order_id: order_id,
        handler: async function (response: any) {
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment Successful! Funds added to wallet.');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.full_name || '',
          email: 'nkashyapnikhilnk@gmail.com'
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-8 rounded-[3rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-primary/20 text-primary rounded-2xl">
            <Wallet className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Digital Wallet</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold mt-1">Manage Funds & Billing</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="bg-secondary/50 p-6 rounded-3xl border border-border">
            <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Deposit Amount (INR)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <IndianRupee className="h-6 w-6 text-muted-foreground" />
              </div>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-background rounded-2xl border-none focus:ring-2 focus:ring-primary text-2xl font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Add Funds</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
