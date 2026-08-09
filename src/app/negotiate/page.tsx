'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, FileText, Download, Handshake, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';

type Message = {
  role: 'user' | 'model';
  parts: string[];
};

export default function NegotiatePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: ["Hello! I'm Rit.ai, representing Kaarya.OS. We were very impressed with your technical screening and we'd love to extend you an offer for the Senior Software Engineer role. Our initial target base salary is $120,000. How does that sound?"] }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dealStatus, setDealStatus] = useState<'negotiating' | 'accepted' | 'rejected'>('negotiating');
  const [finalSalary, setFinalSalary] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || dealStatus !== 'negotiating') return;
    
    const newHistory = [...messages, { role: 'user' as const, parts: [input] }];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/negotiate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory })
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'model', parts: [data.response] }]);
      
      if (data.status === 'accepted') {
        setDealStatus('accepted');
        setFinalSalary(data.agreed_salary);
      } else if (data.status === 'rejected') {
        setDealStatus('rejected');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', parts: ["I am experiencing a network connection issue. I am authorized to offer $140000. Do you accept? [OFFER_ACCEPTED: 140000]"] }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadOffer = () => {
    if (dealStatus !== 'accepted' || !finalSalary) return;
    const name = user?.full_name || 'Candidate';
    window.open(`http://localhost:8000/api/negotiate/offer/${finalSalary}/${name}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
            
            <div className="flex items-center justify-between shrink-0">
               <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-3">
                    <Handshake className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Rit.ai Negotiator</span>
                  </div>
                  <h1 className="text-3xl font-black">Offer Negotiation</h1>
               </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
               
               {/* Left Panel: Chat Interface */}
               <div className="bg-card border border-border rounded-3xl shadow-xl flex flex-col overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary),0.05),transparent_50%)] pointer-events-none" />
                  
                  <div className="p-4 border-b border-border/50 bg-secondary/30 backdrop-blur-md z-10 flex items-center space-x-4">
                     <div className="relative">
                        <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                           <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card" />
                     </div>
                     <div>
                        <h3 className="font-bold">Rit.ai</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Kaarya Executive Recruiter</p>
                     </div>
                  </div>
                  
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth">
                     {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] rounded-2xl p-4 ${
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_0_20px_rgba(var(--primary),0.2)]' 
                                : 'bg-secondary text-foreground rounded-tl-sm border border-border/50'
                           }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.parts[0]}</p>
                           </div>
                        </div>
                     ))}
                     
                     {isTyping && (
                        <div className="flex justify-start">
                           <div className="bg-secondary rounded-2xl rounded-tl-sm p-4 border border-border/50 flex space-x-2">
                              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                           </div>
                        </div>
                     )}
                     
                     {dealStatus === 'accepted' && (
                        <div className="flex justify-center mt-8">
                           <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-3 rounded-full flex items-center space-x-2">
                              <Handshake className="h-5 w-5" />
                              <span className="font-bold uppercase tracking-widest text-sm">Deal Reached</span>
                           </div>
                        </div>
                     )}
                     
                     {dealStatus === 'rejected' && (
                        <div className="flex justify-center mt-8">
                           <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-3 rounded-full flex items-center space-x-2">
                              <XCircle className="h-5 w-5" />
                              <span className="font-bold uppercase tracking-widest text-sm">Offer Retracted</span>
                           </div>
                        </div>
                     )}
                  </div>
                  
                  <div className="p-4 border-t border-border/50 bg-secondary/30 backdrop-blur-md z-10">
                     <div className="relative flex items-center">
                        <input 
                          type="text" 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          disabled={dealStatus !== 'negotiating' || isTyping}
                          placeholder={dealStatus === 'negotiating' ? "Enter your counter offer..." : "Negotiation closed."}
                          className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
                        />
                        <button 
                          onClick={handleSend}
                          disabled={!input.trim() || dealStatus !== 'negotiating' || isTyping}
                          className="absolute right-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
                        >
                           <Send className="h-5 w-5" />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right Panel: Dynamic Offer Letter */}
               <div className="hidden lg:flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-[#0a0a0c]" />
                  
                  <div className="relative z-10 flex-1 p-12 flex flex-col">
                     <div className="flex justify-between items-start mb-16 pt-8">
                        <div>
                           <h2 className="text-3xl font-black text-white">Kaarya.OS</h2>
                        </div>
                        <div className="text-right text-[#0a0a0c]">
                           <h3 className="font-bold tracking-widest text-sm text-gray-500">OFFICIAL OFFER LETTER</h3>
                           <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString()}</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 text-[#0a0a0c] space-y-6">
                        <p className="text-lg">Dear <strong>{user?.full_name || 'Candidate'}</strong>,</p>
                        <p className="leading-relaxed text-gray-600">
                           We are thrilled to officially offer you the position of <strong className="text-black">Senior Software Engineer</strong> at Kaarya.OS. Your technical evaluation and simulation results were outstanding, and we believe you will be an exceptional addition to our engineering ecosystem.
                        </p>
                        
                        <div className="py-8 border-y border-gray-200 my-8">
                           <h4 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-6">Compensation Details</h4>
                           
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <span className="font-medium text-gray-600">Base Salary (USD)</span>
                                 {dealStatus === 'accepted' ? (
                                    <span className="text-xl font-black text-green-600">${finalSalary?.toLocaleString()} / yr</span>
                                 ) : (
                                    <span className="text-xl font-black text-gray-300 blur-[4px] select-none">$135,000 / yr</span>
                                 )}
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="font-medium text-gray-600">Signing Bonus</span>
                                 <span className="text-lg font-bold text-black">$10,000</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="font-medium text-gray-600">Equity (RSU)</span>
                                 <span className="text-lg font-bold text-black">0.1% (4-yr vest)</span>
                              </div>
                           </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 italic">
                           This document is being autonomously negotiated. It will be officially minted as a PDF upon mutual agreement.
                        </p>
                     </div>
                     
                     <div className="pt-8 flex justify-between items-end shrink-0">
                        <div>
                           <div className="w-48 h-px bg-gray-300 mb-2" />
                           <p className="font-bold text-sm text-[#0a0a0c]">Kumar Nikhil</p>
                           <p className="text-xs text-gray-500">Founder & CEO, Kaarya.OS</p>
                        </div>
                        
                        {dealStatus === 'accepted' && (
                           <motion.button 
                             initial={{ scale: 0.9, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             onClick={handleDownloadOffer}
                             className="flex items-center space-x-2 px-6 py-3 bg-[#0a0a0c] text-white rounded-xl font-bold shadow-2xl hover:scale-105 transition-transform"
                           >
                              <FileText className="h-5 w-5" />
                              <span>Download PDF</span>
                           </motion.button>
                        )}
                     </div>
                  </div>
               </div>
               
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
