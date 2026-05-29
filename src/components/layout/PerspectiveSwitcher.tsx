'use client';

import { useState } from 'react';
import { ChevronDown, Check, User, Building, Briefcase, GraduationCap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const personas = [
  { id: 'candidate', label: 'Candidate', icon: GraduationCap, color: 'text-blue-500' },
  { id: 'professional', label: 'Professional', icon: User, color: 'text-purple-500' },
  { id: 'company', label: 'Company', icon: Building, color: 'text-emerald-500' },
  { id: 'trainer', label: 'Trainer', icon: Briefcase, color: 'text-amber-500' },
  { id: 'college', label: 'College', icon: Users, color: 'text-rose-500' },
];

export default function PerspectiveSwitcher({ 
  currentPersona, 
  onSwitch 
}: { 
  currentPersona: string, 
  onSwitch: (id: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const active = personas.find(p => p.id === currentPersona) || personas[0];

  return (
    <div className="relative px-3 mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border hover:bg-secondary transition-all duration-300 group"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-background border border-border group-hover:scale-110 transition-transform duration-300 ${active.color}`}>
            <active.icon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold leading-none mb-1">Perspective</p>
            <p className="text-sm font-bold leading-none">{active.label}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-3 right-3 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {personas.filter(p => p.id !== currentPersona).map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      onSwitch(persona.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left group"
                  >
                    <div className={`p-2 rounded-lg bg-background border border-border group-hover:scale-105 transition-transform duration-200 ${persona.color}`}>
                      <persona.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{persona.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
