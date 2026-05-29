'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 'intro',
    message: "Hi! I'm Rit.ai. I'll be your guide in Kaarya.OS. What should I call you?",
    type: 'text',
    field: 'fullName'
  },
  {
    id: 'roles',
    message: "Nice to meet you! Tell me, what's your primary goal today? (Select all that apply)",
    type: 'roles',
    field: 'roles'
  },
  {
    id: 'motivation',
    message: "Understood. What's one thing you hope to achieve here?",
    type: 'text',
    field: 'motivation'
  }
];

export default function ConversationalOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({ fullName: '', roles: [], motivation: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const activeStep = steps[currentStep];

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
      setHistory(prev => [...prev, { type: 'bot', message: activeStep.message }]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = (val: any) => {
    setAnswers({ ...answers, [activeStep.field]: val });
    setHistory(prev => [...prev, { type: 'user', message: Array.isArray(val) ? val.join(', ') : val }]);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step: Success
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setHistory(prev => [...prev, { type: 'bot', message: "Excellent! I've personalized your workspace. Ready to begin?" }]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full flex flex-col h-[80vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500" />
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {history.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-start space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${msg.type === 'bot' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                  {msg.type === 'bot' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm text-sm leading-relaxed ${
                  msg.type === 'bot' ? 'bg-muted/50 rounded-tl-none border border-border/50' : 'bg-primary text-primary-foreground rounded-tr-none'
                }`}>
                  {msg.message}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div className="flex items-center space-x-2 text-muted-foreground ml-12">
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Controls */}
        <div className="p-6 border-t border-border bg-muted/20">
          {!isTyping && history.length > 0 && currentStep < steps.length && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {activeStep.type === 'text' && (
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    placeholder="Type here..."
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                         handleNext(e.currentTarget.value);
                         e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              )}
              {activeStep.type === 'roles' && (
                <div className="grid grid-cols-2 gap-2">
                  {['Candidate', 'Professional', 'Trainer', 'Company', 'College'].map(role => (
                    <button 
                      key={role}
                      onClick={() => handleNext(role.toLowerCase())}
                      className="p-3 border border-border rounded-xl bg-background hover:bg-primary/5 hover:border-primary transition-all text-sm font-medium text-left"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {!isTyping && history.length === (steps.length + 1) && (
             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => window.location.href = '/'}
               className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center group shadow-lg shadow-primary/20"
             >
               Go to Dashboard <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
             </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
