'use client';

import { useState } from 'react';
import { X, CheckCircle2, IndianRupee, Sparkles, CreditCard, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRazorpay } from '@/hooks/useRazorpay';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface HireModalProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HireModal({ candidate, isOpen, onClose, onSuccess }: HireModalProps) {
  const [ctc, setCtc] = useState<number>(0);
  const { openCheckout } = useRazorpay();
  const [loading, setLoading] = useState(false);

  // Platform Fee logic: ₹499-₹999 OR 2% CTC (whichever higher as per user rule, or 2% flat for senior)
  const platformFee = Math.max(999, ctc * 0.02);

  const handlePayment = async () => {
    if (ctc <= 0) return alert("Please enter valid CTC");
    
    setLoading(true);
    try {
      // Step 1: Create Order locally or on backend
      const response = await api.post('/api/payments/create-order', {
        item_type: 'hire_standard',
        custom_amount: platformFee
      });

      const orderData = response.data;

      // If backend is in mock mode due to missing keys, bypass Razorpay UI
      if (orderData.id && orderData.id.startsWith("order_mock_")) {
          await api.post('/api/payments/verify', {
              order_id: orderData.id,
              payment_id: "pay_mock_123456",
              signature: "mock_signature",
              item_type: 'hire_standard',
              amount: platformFee
          });
          toast.success('Mock Transaction Successful.');
          onSuccess();
          onClose();
          setLoading(false);
          return;
      }

      // Step 2: Open Razorpay
      await openCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Kaarya.OS',
        description: `Hiring fee for ${candidate.name}`,
        order_id: orderData.id,
        handler: async (paymentResponse: any) => {
           // Step 3: Verify and Mark Hired
           try {
             await api.post('/api/payments/verify', {
               order_id: paymentResponse.razorpay_order_id,
               payment_id: paymentResponse.razorpay_payment_id,
               signature: paymentResponse.razorpay_signature,
               item_type: 'hire_standard',
               amount: platformFee
             });
             
             toast.success('Payment Successful!');
             onSuccess();
             onClose();
           } catch (err) {
             toast.error('Payment Verification Failed');
           }
        },
        prefill: {
          name: 'Company Admin',
          email: 'admin@google.com'
        },
        theme: { color: '#3b82f6' }
      });

    } catch (err) {
      console.error(err);
      alert("Payment failed or cancelled.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-8"
      >
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center space-x-3 text-primary">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-2xl font-bold tracking-tight">Finalize Hiring</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="h-5 w-5" />
           </button>
        </div>

        <div className="space-y-6">
           <div className="p-4 bg-secondary/30 rounded-2xl border border-white/5 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl">
                 {candidate.name.charAt(0)}
              </div>
              <div>
                 <p className="font-bold">{candidate.name}</p>
                 <p className="text-xs text-muted-foreground">Rit Score: {candidate.score}%</p>
              </div>
           </div>

           <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 block">Negotiated CTC (Annual)</label>
              <div className="relative">
                 <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                   type="number"
                   placeholder="e.g. 1200000"
                   onChange={(e) => setCtc(parseInt(e.target.value) || 0)}
                   className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-4 text-sm font-black focus:ring-1 focus:ring-primary outline-none transition-all"
                 />
              </div>
           </div>

           <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Platform Commission (2%)</p>
              <div className="flex justify-between items-end">
                 <p className="text-3xl font-black">₹{platformFee.toLocaleString()}</p>
                 <div className="flex items-center text-emerald-500 text-[10px] font-bold">
                    <Lock className="h-3 w-3 mr-1" />
                    SECURE CHARGE
                 </div>
              </div>
           </div>

           <button 
             onClick={handlePayment}
             disabled={loading || ctc <= 0}
             className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
           >
              <CreditCard className="h-5 w-5" />
              <span>{loading ? 'Processing...' : 'Pay & Hire Candidate'}</span>
           </button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground mt-6 uppercase font-bold tracking-tighter italic">
           Candidate will be notified of their success immediately after payment verification.
        </p>
      </motion.div>
    </div>
  );
}
