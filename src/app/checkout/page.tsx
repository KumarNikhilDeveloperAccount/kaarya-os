'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, Zap, 
  CheckCircle2, ArrowRight, Lock, 
  Globe, Info, Bot, Sparkles, 
  Loader2, ChevronRight
} from 'lucide-react';

export default function CheckoutPage() {
  const [step, setStep] = useState('review'); // review, payment, processing, success
  const [paymentMethod, setPaymentMethod] = useState('card');

  const plan = {
    name: 'Elite Talent Integration',
    price: 599,
    features: [
      'Full Rit.AI Deep-Scan',
      'Engineering Lab Access (48h)',
      'Verified Candidate Badge',
      'Direct Priority Pipeline'
    ]
  };

  const handlePayment = () => {
    setStep('processing');
    setTimeout(() => setStep('success'), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="space-y-8">
           <div className="flex items-center space-x-3 text-primary">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-2xl font-black tracking-tight uppercase">Order Summary</h2>
           </div>
           
           <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Bot className="h-24 w-24" />
              </div>
              <div className="space-y-6 relative">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Selected Protocol</span>
                    <h3 className="text-2xl font-black mt-1 tracking-tight">{plan.name}</h3>
                 </div>
                 <ul className="space-y-3">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center text-xs font-bold text-muted-foreground">
                         <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-3 shrink-0" />
                         {f}
                      </li>
                    ))}
                 </ul>
                 <div className="pt-6 border-t border-border flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Integration Cost</p>
                       <p className="text-4xl font-black tracking-tighter mt-1">₹{plan.price}</p>
                    </div>
                    <div className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                       One-time
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-secondary/30 rounded-3xl border border-border/50 flex items-start space-x-4">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Our payment gateway is secured with 256-bit AES encryption. Your integration will be active immediately upon confirmation.
              </p>
           </div>
        </div>

        {/* Checkout Flow */}
        <div className="flex flex-col">
           <AnimatePresence mode="wait">
              {step === 'review' && (
                <motion.div 
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 h-full flex flex-col"
                >
                   <div className="space-y-6">
                      <h3 className="text-xl font-black uppercase tracking-tight">Payment Method</h3>
                      <div className="grid grid-cols-1 gap-4">
                         <PaymentOption 
                           id="card" 
                           label="Credit / Debit Card" 
                           icon={CreditCard} 
                           active={paymentMethod === 'card'} 
                           onClick={() => setPaymentMethod('card')} 
                         />
                         <PaymentOption 
                           id="upi" 
                           label="UPI / PhonePe / GPay" 
                           icon={Zap} 
                           active={paymentMethod === 'upi'} 
                           onClick={() => setPaymentMethod('upi')} 
                         />
                      </div>
                   </div>

                   <div className="mt-auto pt-8">
                      <button 
                        onClick={() => setStep('payment')}
                        className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                      >
                         <span>Proceed to Payment</span>
                         <ArrowRight className="h-5 w-5" />
                      </button>
                   </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                   <div className="space-y-6">
                      <h3 className="text-xl font-black uppercase tracking-tight">Enter Credentials</h3>
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Cardholder Identity</label>
                            <input className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all" placeholder="KUMAR NIKHIL" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Card Digits</label>
                            <div className="relative">
                               <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                               <input className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none transition-all" placeholder="4242 4242 4242 4242" />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Expiry</label>
                               <input className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all" placeholder="12/28" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">CVV</label>
                               <div className="relative">
                                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <input className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none transition-all" type="password" placeholder="•••" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8">
                      <button 
                        onClick={handlePayment}
                        className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                      >
                         <ShieldCheck className="h-5 w-5" />
                         <span>Pay ₹{plan.price} Securely</span>
                      </button>
                      <button 
                        onClick={() => setStep('review')}
                        className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4 hover:text-primary transition-colors"
                      >
                         Change Method
                      </button>
                   </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                >
                   <div className="relative">
                      <Loader2 className="h-16 w-16 text-primary animate-spin" />
                      <Bot className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Syncing Payload...</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-2">Rit.AI is communicating with the banking cluster.</p>
                   </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-10"
                >
                   <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/10">
                      <CheckCircle2 className="h-12 w-12" />
                   </div>
                   <div className="space-y-4 mb-10">
                      <h3 className="text-3xl font-black uppercase tracking-tight">Integration Confirmed!</h3>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
                        Welcome to the Elite tier of Kaarya.OS. Your profile is now being prioritized in the global talent grid.
                      </p>
                   </div>
                   <button 
                     onClick={() => window.location.href = '/'}
                     className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                   >
                      <span>Return to Dashboard</span>
                      <ChevronRight className="h-5 w-5" />
                   </button>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ id, label, icon: Icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 border rounded-[1.5rem] flex items-center justify-between transition-all group ${
        active 
        ? 'border-primary bg-primary/5 ring-4 ring-primary/5' 
        : 'border-border bg-card hover:border-primary/30'
      }`}
    >
       <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
             <Icon className="h-5 w-5" />
          </div>
          <span className={`text-sm font-black uppercase tracking-widest ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
       </div>
       <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-primary bg-primary' : 'border-border'}`}>
          {active && <CheckCircle2 className="h-3 w-3 text-white" />}
       </div>
    </button>
  );
}
