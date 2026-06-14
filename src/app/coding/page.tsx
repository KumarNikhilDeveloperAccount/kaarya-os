'use client';

import { useState } from 'react';
import { 
  Code2, Play, Save, FileCode, Terminal, RefreshCw, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_CODE: Record<string, string> = {
  python: 'def solve_challenge():\n    # Your code here\n    print("Hello from Python")\n\nsolve_challenge()',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++" << std::endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java");\n    }\n}'
};

export default function CodingPage() {
  const [language, setLanguage] = useState<'python'|'c'|'cpp'|'java'>('python');
  const [code, setCode] = useState(DEFAULT_CODE['python']);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput([`[${new Date().toLocaleTimeString()}] Initializing ${language} environment...`]);
    
    try {
      const { api } = await import('@/lib/api');
      setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing code...`]);
      const response = await api.post('/api/coding/execute', { code, language });
      const resultLines = response.data.output.split('\n');
      setOutput(prev => [...prev, ...resultLines, `[${new Date().toLocaleTimeString()}] Execution completed.`]);
    } catch (err: any) {
      setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Execution Failed: Server Error`]);
    } finally {
      setIsRunning(false);
    }
  };

  const saveFiles = async () => {
    setIsSaving(true);
    try {
      const { api } = await import('@/lib/api');
      await api.patch('/api/auth/me', { resume_data: { last_code: code, last_lang: language } });
    } catch (err) {}
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'python'|'c'|'cpp'|'java';
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col -m-6 animate-in fade-in duration-1000">
      {/* Utility Bar */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2 text-primary">
              <Code2 className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Engineering Lab v4.1</span>
           </div>
           <div className="h-4 w-px bg-border" />
           <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Environment:</span>
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="bg-secondary text-xs font-mono font-bold px-3 py-1 rounded outline-none border border-border focus:border-primary/50"
              >
                 <option value="python">Python 3.10</option>
                 <option value="c">GCC (C)</option>
                 <option value="cpp">G++ (C++)</option>
                 <option value="java">Java 17</option>
              </select>
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
              <span>{isRunning ? 'Running...' : 'Execute Code'}</span>
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Challenge Description Panel */}
         <div className="w-80 border-r border-border bg-card flex flex-col shrink-0">
            <div className="p-4 border-b border-border flex items-center space-x-2 text-primary">
               <BookOpen className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Active Challenge</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div>
                  <h2 className="text-xl font-black tracking-tight mb-2">Two Sum Verification</h2>
                  <div className="flex space-x-2 mb-4">
                     <span className="text-[10px] font-bold bg-secondary px-2 py-1 rounded-md uppercase">Easy</span>
                     <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md uppercase">Arrays</span>
                  </div>
               </div>
               
               <div className="prose prose-sm dark:prose-invert">
                  <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return the values of the two numbers such that they add up to <code>target</code>.</p>
                  <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                  
                  <h4>Example 1:</h4>
                  <pre className="bg-secondary p-3 rounded-xl border border-border">
                    Input: nums = [2,7,11,15], target = 9{'\n'}
                    Output: [2, 7]
                  </pre>
                  
                  <h4>Constraints:</h4>
                  <ul>
                     <li><code>2 &lt;= nums.length &lt;= 10^4</code></li>
                     <li><code>-10^9 &lt;= nums[i] &lt;= 10^9</code></li>
                  </ul>
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
            </div>

            {/* Terminal Area */}
            <div className="h-64 border-t border-border bg-[#09090b] text-emerald-500 font-mono text-xs overflow-hidden flex flex-col">
               <div className="h-8 border-b border-white/5 bg-white/5 flex items-center justify-between px-4">
                  <div className="flex items-center space-x-2">
                     <Terminal className="h-3 w-3" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Execution Console</span>
                  </div>
                  <button onClick={() => setOutput([])} className="text-[8px] font-bold uppercase tracking-widest hover:text-white transition-colors">Clear</button>
               </div>
               <div className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-500/20">
                  {output.length === 0 ? (
                    <div className="text-white/20 italic">No execution logs. Click 'Execute Code' to run your program.</div>
                  ) : (
                    output.map((line, i) => (
                      <div key={i} className="flex items-start space-x-2">
                         <span className="text-white/20 shrink-0">❯</span>
                         <span className="break-all whitespace-pre-wrap">{line}</span>
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
      </div>
    </div>
  );
}
