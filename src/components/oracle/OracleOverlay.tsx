'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, Briefcase, User, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function OracleOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state on open
      setQuery('');
      setResults([]);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch('http://localhost:8000/api/oracle/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Oracle search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 font-sans">
          {/* Blur Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          
          {/* Main Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          >
             {/* Glowing header bar */}
             <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
             
             {/* Search Input Area */}
             <div className="p-4 flex items-center space-x-4 border-b border-border bg-secondary/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <input 
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Oracle... (e.g., 'Find senior React engineers')"
                  className="flex-1 bg-transparent border-none outline-none text-xl placeholder:text-muted-foreground/50 text-foreground"
                />
                
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <div className="flex items-center space-x-1 bg-background px-2 py-1 rounded border border-border text-[10px] text-muted-foreground font-mono">
                    <span>ESC</span>
                  </div>
                )}
             </div>

             {/* Results Area */}
             <div className="max-h-[50vh] overflow-y-auto p-2">
                {!query.trim() && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Type natural language to search the entire ecosystem.</p>
                  </div>
                )}
                
                {query.trim() && !isSearching && results.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No entities found matching your criteria.</p>
                  </div>
                )}
                
                {results.map((result, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleNavigate(result.url)}
                    className="flex items-center p-3 hover:bg-secondary rounded-xl cursor-pointer transition-colors group"
                  >
                     <div className={`p-2 rounded-lg mr-4 ${result.type === 'job' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {result.type === 'job' ? <Briefcase className="h-5 w-5" /> : <User className="h-5 w-5" />}
                     </div>
                     <div className="flex-1">
                        <h4 className="text-sm font-bold">{result.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{result.subtitle}</p>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                     </div>
                  </div>
                ))}
             </div>
             
             {/* Footer */}
             <div className="p-3 bg-secondary/30 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <span>Kaarya.OS Global Search Engine</span>
                <span className="flex items-center"><Sparkles className="h-3 w-3 mr-1" /> NLP Active</span>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
