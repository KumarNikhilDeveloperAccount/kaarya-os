'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Search, Filter, 
  ChevronRight, Clock, CheckCircle2, User, 
  Send, Paperclip, Smile, X, Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketContent, setNewTicketContent] = useState('');

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch messages when active ticket changes
  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket.id);
    } else {
      setMessages([]);
    }
  }, [activeTicket]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/support/');
      setTickets(response.data);
    } catch (err) {
      toast.error('Failed to load tickets');
    }
  };

  const fetchMessages = async (ticketId: number) => {
    try {
      const response = await api.get(`/api/support/${ticketId}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeTicket) return;
    setIsLoading(true);
    try {
      const response = await api.post(`/api/support/${activeTicket.id}/messages`, {
        content: input
      });
      setMessages(prev => [...prev, response.data]);
      setInput('');
      toast.success('Message Sent');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/api/support/', {
        subject: newTicketSubject,
        content: newTicketContent
      });
      setTickets(prev => [response.data, ...prev]);
      setActiveTicket(response.data);
      setIsNewTicketModalOpen(false);
      setNewTicketSubject('');
      setNewTicketContent('');
      toast.success('Ticket Created Successfully');
    } catch (err) {
      toast.error('Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden h-full">
        {/* Ticket List */}
        <div className="w-full md:w-80 border-r border-border flex flex-col bg-muted/5">
          <div className="p-8 border-b border-border space-y-5">
             <div className="flex items-center justify-between">
                <h2 className="font-black tracking-tight text-xl">Support Desk</h2>
                <button 
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="p-3 bg-primary text-white rounded-xl hover:rotate-90 transition-transform duration-500 shadow-lg shadow-primary/20"
                >
                   <Plus className="h-4 w-4" />
                </button>
             </div>
             <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input placeholder="Search tickets..." className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-xl pl-11 pr-4 py-3 text-xs outline-none transition-all font-medium" />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
             {tickets.length > 0 ? (
               tickets.map(t => (
                 <button 
                   key={t.id} 
                   onClick={() => setActiveTicket(t)}
                   className={`w-full p-6 text-left hover:bg-secondary/50 transition-all group relative ${activeTicket?.id === t.id ? 'bg-primary/5' : ''}`}
                 >
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">TK-{t.id}</span>
                       <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                          t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                       }`}>{t.status}</span>
                    </div>
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors leading-snug">{t.subject}</p>
                    <div className="flex items-center text-[10px] text-muted-foreground mt-3 space-x-4 font-black uppercase tracking-widest opacity-60">
                       <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> {new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    {activeTicket?.id === t.id && (
                      <motion.div layoutId="ticket-active" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                 </button>
               ))
             ) : (
               <div className="p-10 text-center opacity-30 font-bold text-xs uppercase tracking-widest">No Active Tickets</div>
             )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative">
           {activeTicket ? (
             <>
               <div className="p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center space-x-4">
                     <div className="p-3.5 bg-primary/10 text-primary rounded-2xl">
                        <MessageSquare className="h-6 w-6" />
                     </div>
                     <div>
                        <h3 className="font-black text-base tracking-tight">{activeTicket.subject}</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5">TK-{activeTicket.id} • Priority: {activeTicket.priority}</p>
                     </div>
                  </div>
                  <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl transition-all hover:bg-primary/10">Mark as Resolved</button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                  {messages.map((msg, idx) => (
                    <SupportMessage 
                      key={msg.id || idx}
                      role={msg.sender_id === activeTicket.user_id ? 'user' : 'bot'} 
                      time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                      agent="Rit"
                      content={msg.content} 
                    />
                  ))}
               </div>

               <div className="p-8 bg-card border-t border-border">
                  <div className="relative flex items-center space-x-4">
                     <div className="flex-1 relative">
                        <textarea 
                          placeholder="Reply to ticket..." 
                          className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl pl-5 pr-14 py-4 text-sm outline-none resize-none h-24 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                           <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                              <Paperclip className="h-5 w-5 opacity-40" />
                           </button>
                           <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                              <Smile className="h-5 w-5 opacity-40" />
                           </button>
                        </div>
                     </div>
                     <button 
                       onClick={handleSendMessage}
                       disabled={isLoading || !input.trim()}
                       className="h-14 w-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                     >
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                     </button>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-16 opacity-50">
                <div className="w-24 h-24 bg-secondary rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12">
                   <MessageSquare className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Support Command Center</h3>
                <p className="text-sm text-muted-foreground mt-3 max-w-sm font-medium leading-relaxed uppercase tracking-widest text-[9px]">Select an active thread or initiate a new request</p>
             </div>
           )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isNewTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsNewTicketModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="w-full max-w-lg bg-card border border-border p-10 rounded-[3rem] shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">Raise Support Ticket</h3>
                <button onClick={() => setIsNewTicketModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                  <input 
                    required
                    placeholder="e.g., Payment Verification Required"
                    className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-primary/5"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Describe the Issue</label>
                  <textarea 
                    required
                    placeholder="Provide details about your request..."
                    className="w-full bg-secondary border border-transparent focus:border-primary/20 rounded-2xl px-5 py-4 text-sm font-medium outline-none transition-all min-h-[150px] resize-none focus:ring-4 focus:ring-primary/5"
                    value={newTicketContent}
                    onChange={(e) => setNewTicketContent(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Initialize Ticket"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportMessage({ role, content, time, agent }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-5 ${role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black shadow-lg ${
          role === 'user' ? 'bg-secondary text-primary' : 'bg-primary text-white shadow-primary/20'
       }`}>
          {role === 'user' ? 'U' : 'Y'}
       </div>
       <div className={`max-w-lg p-5 rounded-[2rem] shadow-sm border transition-all ${
          role === 'user' 
          ? 'bg-card border-border rounded-tr-none hover:border-primary/20' 
          : 'bg-primary/5 border-primary/20 rounded-tl-none'
       }`}>
          <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{role === 'user' ? 'Authorized User' : `Elite Agent • ${agent}`}</span>
             <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-60 ml-8">{time}</span>
          </div>
          <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{content}</p>
       </div>
    </motion.div>
  );
}
