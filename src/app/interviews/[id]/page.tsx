'use client';

import { useState, useEffect, useRef, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, AlertCircle, Camera, Shield, MoreVertical } from 'lucide-react';
import axios from 'axios';
import IntegrityMonitor from '@/components/interview/IntegrityMonitor';

export default function InterviewSession({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState('initializing');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startInterview = async () => {
    setStatus('in_progress');
    setIsTyping(true);
    try {
      const response = await axios.post(`http://localhost:8000/api/interviews/${id}/start`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages([{ role: 'bot', content: response.data.question }]);
    } catch (error) {
      console.error('Start interview error:', error);
      // Demo fallback
      setMessages([{ role: 'bot', content: "Hello! I am Rit.ai. Your Senior AI Backend Engineer interview begins now. Can you tell me about your experience with FastAPI and system scalability?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`http://localhost:8000/api/interviews/${id}/respond`, {
        user_input: userInput,
        history: messages
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages([...newMessages, { role: 'bot', content: response.data.question }]);
    } catch (error) {
      console.error('Respond error:', error);
      // Demo fallback
      setTimeout(() => {
        setMessages([...newMessages, { role: 'bot', content: "That's insightful. How would you handle a sudden traffic spike of 100k requests/min in that architecture?" }]);
      }, 1500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      {/* Session Monitor (Left) */}
      <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto">
        {/* Monitoring Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center text-sm tracking-tight text-white">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                Session Integrity
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           </div>

           {/* Real Integrity Monitor */}
           <IntegrityMonitor 
             onViolation={(type: string, details: any) => console.log(`Violation: ${type}`, details)}
           />

           <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Identity Verified</span>
                <span className="text-emerald-500 font-bold">YES</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Session Active</span>
                <span className="text-white font-bold">LIVE</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Active Duration</span>
                <span className="text-white font-bold">04:22</span>
              </div>
           </div>
        </div>

        {/* AI Info Card */}
        <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl border border-primary/20 p-6">
           <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                 <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm">Rit.ai Insight</h4>
           </div>
           <p className="text-xs text-muted-foreground leading-relaxed">
             "Rit is currently assessing your communication clarity and architectural depth."
           </p>
        </div>
      </div>

      {/* Primary Chat (Center) */}
      <div className="lg:col-span-9 flex flex-col bg-card rounded-2xl border border-border shadow-soft overflow-hidden h-full relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-secondary/30 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-1 px-3 bg-primary/20 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                Rit.ai Alpha
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${msg.role === 'user' ? 'bg-secondary text-primary' : 'bg-primary/20 text-primary'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-primary text-primary-foreground font-medium rounded-tr-none' 
                : 'bg-secondary/50 text-white rounded-tl-none border border-white/5'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
             <div className="flex items-start space-x-4">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary animate-pulse">
                   <Bot className="h-4 w-4" />
                </div>
                <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-none border border-white/5 flex space-x-1.5">
                   <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-white/5 bg-secondary/30">
          <div className="relative group max-w-4xl mx-auto shadow-2xl">
            <input 
              type="text"
              placeholder="Explain your approach..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-card border border-border group-hover:border-primary/40 rounded-2xl pl-6 pr-16 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
