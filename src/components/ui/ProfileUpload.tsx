'use client';

import { useRef, useState, useEffect } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  hint?: string;
}

export function ProfileUpload({ value, onChange, label = "Profile Picture", hint = "SVG, PNG, JPG or GIF (max. 5MB)" }: ProfileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      // Free memory when component is unmounted or when value changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div 
        className="mt-1 w-full border-2 border-dashed border-border hover:border-primary/50 bg-background/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden min-h-[160px]"
        onClick={() => inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative group/image">
                <img src={previewUrl} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg" />
                <button 
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity shadow-md"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-sm font-medium mt-4 text-primary">Click image to change</span>
            </motion.div>
          ) : (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Click to upload or drag and drop</span>
              <span className="text-xs text-muted-foreground mt-1">{hint}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
