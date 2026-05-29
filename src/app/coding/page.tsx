'use client';

import { useState, useEffect } from 'react';
import { 
  Code2, Play, Save, ChevronRight, FileCode, 
  Terminal, Settings, Share2, PanelLeft, 
  Database, Globe, Cpu, Zap, CheckCircle2, 
  RefreshCw, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodingPage() {
  const [activeFile, setActiveFile] = useState('main.py');
  const [code, setCode] = useState('def calculate_hireability(metrics):\n    # Rit.AI Core Logic\n    score = (metrics["resume"] * 0.3) + (metrics["simulation"] * 0.7)\n    return round(score, 2)\n\nprint(f"Candidate Score: {calculate_hireability({\'resume\': 85, \'simulation\': 92})}")');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const files = [
    { name: 'main.py', icon: FileCode, color: 'text-blue-400' },
    { name: 'utils.py', icon: FileCode, color: 'text-emerald-400' },
    { name: 'config.yaml', icon: Settings, color: 'text-amber-400' },
    { name: 'api_test.sh', icon: Terminal, color: 'text-purple-400' }
  ];

  const runCode = () => {
    setIsRunning(true);
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initializing Engineering Lab environment...`]);
    
    setTimeout(() => {
      setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing main.py...`]);
      setTimeout(() => {
        setOutput(prev => [...prev, `Candidate Score: 89.9`, `[${new Date().toLocaleTimeString()}] Execution completed successfully.`]);
        setIsRunning(false);
      }, 1000);
    }, 800);
  };

  const saveFiles = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col -m-6 animate-in fade-in duration-1000">
      {/* Utility Bar */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2 text-primary">
              <Code2 className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Engineering Lab v4.0</span>
           </div>
           <div className="h-4 w-px bg-border" />
           <div className="flex items-center space-x-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Current Path:</span>
              <span className="text-[10px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">/workspace/kaarya-core-logic/</span>
           </div>
        </div>
        <div className="flex items-center space-x-3">
           <button 
             onClick={saveFiles}
             className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted text-[10px] font-bold uppercase tracking-widest transition-all"
           >
              {isSaving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              <span>{isSaving ? 'Syncing...' : 'Save All'}</span>
           </button>
           <button 
             onClick={runCode}
             disabled={isRunning}
             className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50"
           >
              {isRunning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
              <span>{isRunning ? 'Running...' : 'Execute Lab'}</span>
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* File Explorer */}
         <div className="w-56 border-r border-border bg-muted/5 flex flex-col shrink-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Project Explorer</span>
               <div className="flex space-x-2">
                  <Plus className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" />
                  <FolderPlus className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
               {files.map(file => (
                 <button 
                   key={file.name}
                   onClick={() => setActiveFile(file.name)}
                   className={`w-full flex items-center px-4 py-2 text-xs font-medium transition-all group ${
                     activeFile === file.name ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-muted-foreground hover:bg-secondary'
                   }`}
                 >
                    <file.icon className={`h-4 w-4 mr-3 ${file.color}`} />
                    <span className="truncate">{file.name}</span>
                 </button>
               ))}
            </div>
            <div className="p-4 mt-auto border-t border-border space-y-4">
               <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center space-x-2 mb-2">
                     <Layers className="h-3 w-3 text-primary" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Lab Score</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: isRunning ? '90%' : '75%' }}
                       className="h-full bg-primary" 
                     />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[8px] font-bold text-muted-foreground uppercase">
                     <span>Rank: 12th</span>
                     <span>92/100</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Editor Area */}
         <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-hidden relative group">
               <textarea 
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 className="absolute inset-0 w-full h-full p-8 bg-background font-mono text-sm leading-relaxed outline-none resize-none selection:bg-primary/20"
                 spellCheck="false"
               />
               <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 bg-card border border-border rounded-lg shadow-xl cursor-help" title="Code Quality: 98%">
                     <Zap className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="p-1.5 bg-card border border-border rounded-lg shadow-xl cursor-help" title="Verified by Rit.AI">
                     <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
               </div>
            </div>

            {/* Terminal Area */}
            <div className="h-48 border-t border-border bg-[#09090b] text-emerald-500 font-mono text-xs overflow-hidden flex flex-col">
               <div className="h-8 border-b border-white/5 bg-white/5 flex items-center justify-between px-4">
                  <div className="flex items-center space-x-2">
                     <Terminal className="h-3 w-3" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Rit Dev Console</span>
                  </div>
                  <button onClick={() => setOutput([])} className="text-[8px] font-bold uppercase tracking-widest hover:text-white transition-colors">Clear</button>
               </div>
               <div className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-500/20">
                  {output.length === 0 ? (
                    <div className="text-white/20 italic">No execution logs. Execute lab to see output.</div>
                  ) : (
                    output.map((line, i) => (
                      <div key={i} className="flex items-start space-x-2">
                         <span className="text-white/20 shrink-0">❯</span>
                         <span className="break-all">{line}</span>
                      </div>
                    ))
                  )}
                  {isRunning && (
                    <div className="flex items-center space-x-2">
                       <span className="text-white/20 shrink-0">❯</span>
                       <span className="animate-pulse">_</span>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Inspect Panel */}
         <div className="w-64 border-l border-border bg-card flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
               <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center">
                  <Cpu className="h-3.5 w-3.5 mr-2 text-primary" />
                  Performance Metrics
               </h3>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto flex-1">
               <MetricItem label="Compute Latency" value="12ms" trend="up" />
               <MetricItem label="Memory Heap" value="42.4 MB" trend="stable" />
               <MetricItem label="API Calls" value="1,240/min" trend="down" />
               <MetricItem label="Error Rate" value="0.012%" trend="up" />
               
               <div className="pt-6 border-t border-border">
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-4">Infrastructure Integrity</h4>
                  <div className="grid grid-cols-2 gap-2">
                     <StatusBadge label="AWS-US-E1" status="healthy" />
                     <StatusBadge label="REDIS-01" status="healthy" />
                     <StatusBadge label="AUTH-LAB" status="warning" />
                     <StatusBadge label="RIT-CORE" status="healthy" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, trend }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-muted-foreground uppercase">{label}</span>
          <span className={`text-[9px] font-black ${
            trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-blue-500'
          }`}>
             {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '↔'}
          </span>
       </div>
       <div className="text-xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function StatusBadge({ label, status }: any) {
  return (
    <div className="bg-secondary/50 p-2 rounded-lg border border-border flex flex-col items-center justify-center">
       <span className="text-[8px] font-black truncate w-full mb-1">{label}</span>
       <div className={`h-1.5 w-1.5 rounded-full ${
         status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
       }`} />
    </div>
  );
}

function Plus(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>; }
function FolderPlus(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>; }
