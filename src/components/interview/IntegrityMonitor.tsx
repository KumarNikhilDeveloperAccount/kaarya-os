'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntegrityMonitorProps {
  onViolation?: (type: string, details: any) => void;
  onSnapshot?: (blob: Blob) => void;
}

export default function IntegrityMonitor({ onViolation, onSnapshot }: IntegrityMonitorProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [violationCount, setViolationCount] = useState(0);

  // 1. Tab Visibility Tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
        setViolationCount(prev => prev + 1);
        if (onViolation) onViolation('tab_switch', { timestamp: new Date() });
      } else {
        setIsTabActive(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onViolation]);

  // 2. Periodic Snapshotting (Every 60s)
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && onSnapshot) {
      // In a real app, convert base64 to Blob and upload
      // fetch(imageSrc).then(res => res.blob()).then(onSnapshot);
      console.log("Snapshot captured locally.");
    }
  }, [onSnapshot]);

  useEffect(() => {
    const interval = setInterval(capture, 60000);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="space-y-4">
      {/* Visual Status Indicator */}
      <AnimatePresence>
        {!isTabActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold uppercase tracking-widest"
          >
            <AlertTriangle className="h-3 h-3" />
            <span>Tab Violation Detected!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="aspect-video bg-black rounded-xl relative overflow-hidden border border-white/5 shadow-2xl group">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
          videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
        />
        
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20 flex items-center">
          <Shield className="h-2.5 w-2.5 mr-1.5" />
          Live Identity Feed
        </div>

        {isTabActive ? (
          <div className="absolute bottom-2 right-2 p-1.5 bg-emerald-500/10 rounded-full">
            <Eye className="h-3 h-3 text-emerald-500" />
          </div>
        ) : (
          <div className="absolute bottom-2 right-2 p-1.5 bg-red-500/10 rounded-full animate-pulse">
            <EyeOff className="h-3 h-3 text-red-500" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">
        <span>Violations</span>
        <span className={violationCount > 0 ? "text-red-500" : "text-emerald-500"}>{violationCount}</span>
      </div>
    </div>
  );
}
