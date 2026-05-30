'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function IntroCinematic({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<{x: string, y: string, duration: number, delay: number}[]>([]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 20 }).map(() => ({
        x: Math.random() * 100 + '%',
        y: Math.random() * 100 + '%',
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 2
      }))
    );
    const timer1 = setTimeout(() => setStage(1), 800);
    const timer2 = setTimeout(() => setStage(2), 2200);
    const timer3 = setTimeout(() => onComplete(), 3200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative"
          >
             <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-primary/20 overflow-hidden relative">
                <Image src="/kaarya-logo-final.png" alt="Kaarya OS Logo" fill className="object-contain p-2" />
             </div>
             <motion.div 
               className="absolute -inset-4 rounded-full border-2 border-primary/20"
               animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
               transition={{ duration: 1, repeat: Infinity }}
             />
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ duration: 0.6, ease: 'anticipate' }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-blue-400">
              Kaarya.OS
            </h1>
            <p className="mt-4 text-muted-foreground font-medium tracking-widest uppercase text-sm">
              Hiring, Decided.
            </p>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-primary/5"
          />
        )}
      </AnimatePresence>

      {/* Background Micro-particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{ 
              x: p.x, 
              y: p.y, 
              scale: 0 
            }}
            animate={{ 
              y: [null, '100%'],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity,
              delay: p.delay 
            }}
          />
        ))}
      </div>
    </div>
  );
}
