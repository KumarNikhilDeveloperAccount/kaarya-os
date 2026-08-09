'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, Square, Play, UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Loader2, Sparkles, User, BrainCircuit } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';

export default function KaaryaLensPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mockQuestion = "Can you describe a time when you had to design a scalable microservices architecture? What were the key challenges?";

  useEffect(() => {
    // Start camera feed on mount
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err: any) {
      setError("Could not access camera and microphone. Please ensure permissions are granted.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm; codecs=vp8,opus'
    });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      stopCamera();
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const retryRecording = () => {
    setVideoBlob(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setRecordingTime(0);
    setEvaluation(null);
    startCamera();
  };

  const submitVideo = async () => {
    if (!videoBlob) return;
    
    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('video', videoBlob, 'interview.webm');
    formData.append('question', mockQuestion);
    
    try {
      const response = await fetch('http://localhost:8000/api/lens/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to process video");
      }
      
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
               <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-3">
                    <Video className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Kaarya Lens</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-black">AI Video Interview</h1>
                  <p className="text-muted-foreground mt-2">Record your answer asynchronously. Our AI will analyze your technical proficiency.</p>
               </div>
               
               <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground bg-secondary px-4 py-2 rounded-xl">
                 <BrainCircuit className="h-4 w-4" />
                 <span>Powered by Gemini 1.5 Multimodal</span>
               </div>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
              {!evaluation ? (
                <motion.div 
                  key="recorder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* Left Column: Camera View */}
                  <div className="lg:col-span-2 space-y-6">
                     <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-border shadow-2xl group">
                        {!videoUrl ? (
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className={`w-full h-full object-cover ${isRecording ? 'opacity-100' : 'opacity-80'}`}
                          />
                        ) : (
                          <video 
                            src={videoUrl} 
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Recording Indicator */}
                        {isRecording && (
                           <div className="absolute top-6 right-6 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30">
                              <div className="h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-white text-sm font-bold font-mono">{formatTime(recordingTime)}</span>
                           </div>
                        )}
                        
                        {/* Error Overlay */}
                        {error && !videoUrl && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-6 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                            <p className="text-muted-foreground">{error}</p>
                            <button onClick={startCamera} className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium">Try Again</button>
                          </div>
                        )}
                     </div>

                     {/* Controls */}
                     <div className="flex items-center justify-center space-x-4">
                        {!videoUrl ? (
                          isRecording ? (
                            <button onClick={stopRecording} className="flex items-center space-x-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                              <Square className="h-5 w-5 fill-current" />
                              <span>Finish Recording</span>
                            </button>
                          ) : (
                            <button onClick={startRecording} disabled={!!error} className="flex items-center space-x-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse mr-1" />
                              <span>Start Recording</span>
                            </button>
                          )
                        ) : (
                          <>
                            <button onClick={retryRecording} disabled={isProcessing} className="px-6 py-4 bg-secondary text-foreground rounded-2xl font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center space-x-2">
                              <RefreshCw className="h-5 w-5" />
                              <span>Retake</span>
                            </button>
                            <button onClick={submitVideo} disabled={isProcessing} className="flex-1 max-w-sm px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                              {isProcessing ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  <span>AI Analyzing Video...</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="h-5 w-5" />
                                  <span>Submit for Evaluation</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                     </div>
                  </div>

                  {/* Right Column: Question & Guidelines */}
                  <div className="space-y-6">
                     <div className="p-6 rounded-3xl bg-card border border-border shadow-xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Question 1 of 1</h3>
                        <p className="text-lg font-medium leading-relaxed">
                          {mockQuestion}
                        </p>
                     </div>
                     
                     <div className="p-6 rounded-3xl bg-secondary/50 border border-border/50">
                        <h3 className="font-bold mb-4 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span>AI Guidelines</span>
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                           <li className="flex items-start space-x-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                             <span>Speak clearly. Gemini AI will transcribe your audio for technical evaluation.</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                             <span>Maintain eye contact. The vision model analyzes body language confidence.</span>
                           </li>
                           <li className="flex items-start space-x-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                             <span>Keep it concise. Aim for a 1-2 minute answer focusing on specific architectural details.</span>
                           </li>
                        </ul>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                   {/* Evaluation Summary */}
                   <div className="lg:col-span-2 space-y-6">
                      <div className="p-8 rounded-3xl bg-card border border-border shadow-xl overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
                         
                         <div className="flex items-center space-x-3 mb-6 relative z-10">
                           <CheckCircle2 className="h-8 w-8 text-green-500" />
                           <h2 className="text-2xl font-black">Analysis Complete</h2>
                         </div>
                         
                         <p className="text-lg text-muted-foreground mb-8 relative z-10">
                           {evaluation.overall_summary}
                         </p>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="p-5 rounded-2xl bg-secondary/50 border border-border/50">
                               <h3 className="text-sm font-bold uppercase tracking-wider text-green-500 mb-3">Strengths Detected</h3>
                               <ul className="space-y-2 text-sm">
                                  {evaluation.strengths.map((s: string, i: number) => (
                                    <li key={i} className="flex items-start space-x-2">
                                      <span className="text-green-500 font-bold">•</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                               </ul>
                            </div>
                            <div className="p-5 rounded-2xl bg-secondary/50 border border-border/50">
                               <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-3">Areas for Improvement</h3>
                               <ul className="space-y-2 text-sm">
                                  {evaluation.weaknesses.map((s: string, i: number) => (
                                    <li key={i} className="flex items-start space-x-2">
                                      <span className="text-amber-500 font-bold">•</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                               </ul>
                            </div>
                         </div>
                      </div>
                      
                      <div className="p-6 rounded-3xl bg-card border border-border shadow-xl">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">AI Transcription Transcript</h3>
                        <p className="text-sm leading-loose bg-secondary/30 p-4 rounded-xl border border-border/30 italic">
                          "{evaluation.transcription}"
                        </p>
                      </div>
                   </div>

                   {/* Metrics Sidebar */}
                   <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-card border border-border shadow-xl text-center">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Technical Accuracy</h3>
                         <div className="inline-flex items-center justify-center h-32 w-32 rounded-full border-8 border-primary/20 relative">
                            <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent border-r-transparent transform -rotate-45" />
                            <span className="text-4xl font-black">{evaluation.technical_accuracy}</span>
                         </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-card border border-border shadow-xl text-center">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Communication</h3>
                         <div className="inline-flex items-center justify-center h-32 w-32 rounded-full border-8 border-blue-500/20 relative">
                            <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent border-r-transparent transform rotate-45" />
                            <span className="text-4xl font-black">{evaluation.communication_clarity}</span>
                         </div>
                      </div>

                      <button onClick={retryRecording} className="w-full px-6 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl font-bold transition-colors">
                        New Interview
                      </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </main>
      </div>
    </div>
  );
}
