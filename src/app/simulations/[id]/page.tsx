'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, ArrowLeft, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CodeEditor from '@/components/simulation/CodeEditor';
import Terminal from '@/components/simulation/Terminal';
import axios from 'axios';

export default function SimulationWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [code, setCode] = useState(`def solve():\n    # Write your solution here\n    print("Hello from Kaarya.OS Simulation!")\n\nsolve()`);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      // In a real app, use the backend URL
      const response = await axios.post('http://localhost:8000/api/sandbox/run', {
        code,
        language: 'python'
      });
      setOutput(response.data.stdout);
      setError(response.data.stderr || null);
    } catch (err: any) {
      console.error('Run error:', err);
      setError(err.response?.data?.detail || 'Execution failed. Ensure Docker is running.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border">
        <div className="flex items-center space-x-4">
          <Link href="/jobs" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Python Skill Simulation: # {id}</h1>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Session Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
           <button 
             onClick={() => setCode(`def solve():\n    # Resetting...\n    print("Hello from Kaarya.OS Simulation!")\n\nsolve()`)}
             className="px-4 py-2 hover:bg-secondary rounded-lg transition-all text-xs font-bold"
           >
             Reset
           </button>
           <button 
             disabled={isRunning}
             onClick={handleRun}
             className="px-6 py-2 bg-primary text-primary-foreground rounded-lg transition-all font-bold text-xs flex items-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50"
           >
             <Play className="h-3.5 w-3.5 mr-2 fill-current" />
             {isRunning ? 'Executing...' : 'Run Simulation'}
           </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Task Info (Left) */}
        <div className="lg:col-span-3 bg-card p-6 rounded-2xl border border-border flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center space-x-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold">Task Description</h3>
            </div>
            
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>Implement a function <code className="px-1.5 py-0.5 bg-secondary rounded font-mono text-xs">solve()</code> that calculates the factorial of a given input or simply demonstrates a robust algorithm.</p>
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 italic text-[13px]">
                   "Rit.ai is monitoring your code quality, efficiency, and edge-case handling."
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-border">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">Requirements</h4>
                <ul className="space-y-3">
                    <li className="flex items-center text-xs">
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                        Valid Syntax
                    </li>
                    <li className="flex items-center text-xs">
                        <CheckCircle className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                        Prints Output
                    </li>
                    <li className="flex items-center text-xs opacity-50">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground mr-2" />
                        No Infinite Loops
                    </li>
                </ul>
            </div>
        </div>

        {/* Editor (Center) */}
        <div className="lg:col-span-6 overflow-hidden">
          <CodeEditor code={code} language="python" onChange={(v) => setCode(v || '')} />
        </div>

        {/* Terminal (Right) */}
        <div className="lg:col-span-3 overflow-hidden">
          <Terminal output={output} error={error} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
}
