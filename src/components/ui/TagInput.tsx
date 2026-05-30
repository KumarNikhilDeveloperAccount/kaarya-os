'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  maxTags?: number;
}

export function TagInput({ tags, setTags, placeholder = "Type and press Enter...", label, maxTags = 10 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        setTags([...tags, newTag]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full space-y-2">
      {label && <label className="text-sm font-semibold text-foreground/80">{label}</label>}
      <div className="min-h-[56px] w-full bg-background border border-border rounded-xl p-2 flex flex-wrap gap-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length < maxTags ? placeholder : `Maximum ${maxTags} tags reached`}
          disabled={tags.length >= maxTags}
          className="flex-1 min-w-[120px] bg-transparent outline-none px-2 py-1 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
