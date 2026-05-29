'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, BrainCircuit, Lightbulb, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Global state mechanism for triggering the panel
let toggleRitPanel: (open?: boolean) => void = () => {};
export const openRit = () => toggleRitPanel(true);

export default function RitPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi! I'm Rit.ai. I've analyzed your current state. You're 70% hireable in the 'Senior Engineer' track. Want to know how to reach 90%?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Expose toggle function globally
  useEffect(() => {
    toggleRitPanel = (open?: boolean) => {
      setIsOpen(prev => open !== undefined ? open : !prev);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (text: string = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate Rit Intelligence
    setTimeout(() => {
      setIsTyping(false);
      const responses: Record<string, string> = {
        "How is my score calculated?": "Your score is a weighted average of your Resume Depth (30%), Simulation Accuracy (50%), and Communication Clarity (20%). We use LLM-based vector analysis to compare you with top 1% engineers.",
        "Suggest my next simulation": "Based on your recent 'System Design' performance, I recommend the 'Distributed Cache Implementation' simulation. It will boost your infrastructure score by 15%.",
        "Improve my profile completeness": "You're missing a 'Personal Project' link and 'Github' verification. Adding these will give recruiters more evidence of your hands-on capability."
      };
      
      const botResponse = responses[text] || "I've processed your query. As your AI guide, I recommend exploring the 'Engineering Lab' to further validate your coding depth in 'Distributed Systems'.";
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    }, 1500);
  };

  const suggestions = [
    "How is my score calculated?",
    "Suggest my next simulation",
    "Improve my profile completeness"
  ];

  return (
    <>
      {/* Floating Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Bot className="h-6 w-6 group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center space-x-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-xl font-bold">
                     <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-black tracking-tight">Rit.AI</h2>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">System Intelligence</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                 {messages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg' 
                        : 'bg-muted/50 border border-border/50 rounded-tl-none font-medium'
                      }`}>
                         {msg.content}
                      </div>
                   </div>
                 ))}
                 {isTyping && (
                   <div className="flex justify-start">
                     <div className="bg-muted/30 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Rit is thinking...</span>
                     </div>
                   </div>
                 )}
              </div>

              <div className="p-6 border-t border-border space-y-4">
                 <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button 
                        key={s} 
                        className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-border bg-secondary hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                        onClick={() => handleSendMessage(s)}
                      >
                         {s}
                      </button>
                    ))}
                 </div>
                 <div className="relative">
                   <input 
                     placeholder="Ask Rit anything..."
                     className="w-full bg-secondary border border-border rounded-xl pl-4 pr-12 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   />
                   <button 
                     onClick={() => handleSendMessage()}
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:scale-105 active:scale-95 transition-all"
                   >
                      <Send className="h-4 w-4" />
                   </button>
                 </div>
                 <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-tighter">
                    Intelligence based on current platform data.
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
