'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export default function ModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-secondary hover:bg-muted text-muted-foreground transition-all duration-300 relative overflow-hidden group"
      aria-label="Toggle Theme"
    >
      <motion.div
        animate={{ y: theme === 'dark' ? 0 : 30 }}
        className="flex items-center justify-center"
      >
        <Moon className="h-5 w-5 group-hover:text-primary transition-colors" />
      </motion.div>
      
      <motion.div
        animate={{ y: theme === 'classic' ? -22 : 0 }}
        initial={{ y: 0 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-5 w-5 group-hover:text-amber-500 transition-colors" />
      </motion.div>
    </button>
  );
}
