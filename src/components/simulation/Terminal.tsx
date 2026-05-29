'use client';

import { Terminal as TerminalIcon, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalProps {
  output: string;
  error: string | null;
  isRunning: boolean;
}

export default function Terminal({ output, error, isRunning }: TerminalProps) {
  return (
    <div className="h-full bg-[#0d0d0d] text-emerald-400 font-mono p-4 rounded-xl border border-border/50 shadow-inner overflow-y-auto">
      <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-2">
        <TerminalIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Output Console</span>
      </div>

      <div className="space-y-1 text-sm">
        {isRunning ? (
          <div className="flex items-center space-x-2 text-muted-foreground animate-pulse">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Running execution...</span>
          </div>
        ) : (
          <>
            {error ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-2 text-red-400 mb-4 bg-red-400/5 p-2 rounded-lg border border-red-400/20"
              >
                <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <pre className="whitespace-pre-wrap">{error}</pre>
              </motion.div>
            ) : null}

            {output ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-2 mb-4"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <pre className="whitespace-pre-wrap">{output}</pre>
              </motion.div>
            ) : (
              <div className="text-zinc-600 italic">No output yet. Click 'Run' to execute.</div>
            )}
          </>
        )}
      </div>
      
      {/* Auto-scroll anchor could go here */}
    </div>
  );
}
