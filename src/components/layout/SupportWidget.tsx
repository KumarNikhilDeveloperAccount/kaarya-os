'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, LifeBuoy, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SupportWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'support', text: 'Welcome to Kaarya OS Support Control. How can we help fix your blockers today?' }
  ]);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  // Sync with backend on open
  const fetchActiveTicket = async () => {
    try {
      const res = await api.get('/api/support/');
      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        setActiveTicketId(latest.id);
        const history = latest.messages.map((m: any) => ({
          role: m.sender_id === user?.id ? 'user' : 'support',
          text: m.content
        }));
        if (history.length > 0) setMessages(history);
      }
    } catch (err) {
      console.error("Support sync failed");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const usrMsg = input;
    setMessages((prev: any[]) => [...prev, { role: 'user', text: usrMsg }]);
    setInput('');

    try {
      if (!activeTicketId) {
        // Create new ticket
        const res = await api.post('/api/support/', {
          subject: `Friction Report: ${usrMsg.substring(0, 30)}...`,
          content: usrMsg
        });
        setActiveTicketId(res.data.id);
      } else {
        // Reply to existing
        await api.post(`/api/support/${activeTicketId}/messages`, {
          content: usrMsg
        });
      }
      
      // Simulated Expert Response (In production, an actual admin or AI agent would reply)
      setTimeout(() => {
        setMessages((prev: any[]) => [...prev, { role: 'support', text: 'Command Center acknowledged. Ritual established. A senior engineer is investigating.' }]);
        toast.success('Blocker Reported Successfully');
      }, 800);
    } catch (err) {
      toast.error('Direct link to Command Center failed. Try again.');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-card border-none ring-4 ring-card text-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <MessageSquare className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-background"></span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 w-80 sm:w-96 bg-card border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 rounded-[2rem] overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-6 text-white relative">
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-colors">
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center space-x-3">
                 <LifeBuoy className="h-8 w-8" />
                 <div>
                   <h3 className="font-extrabold text-lg leading-none">Kaarya Support</h3>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/70 mt-1 block">Live Command Center</span>
                 </div>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-6 space-y-4 bg-muted/20">
               {messages.map((m: any, i: number) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`text-sm p-4 rounded-2xl max-w-[85%] font-medium ${m.role === 'user' ? 'bg-primary text-white rounded-br-sm shadow-xl' : 'bg-card border border-border rounded-bl-sm shadow-sm'}`}>
                      {m.text}
                   </div>
                 </div>
               ))}
            </div>

            <div className="p-4 border-t border-border bg-card relative">
               <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSend()}
                 placeholder="Describe the friction..."
                 className="w-full bg-secondary text-sm px-4 py-3 pb-3 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
               />
               <button onClick={handleSend} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:scale-105 active:scale-95 transition-transform"><Send className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
