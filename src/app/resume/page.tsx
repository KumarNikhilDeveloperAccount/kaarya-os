'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, User, Briefcase, GraduationCap, Code, Loader2, Sparkles, X } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';

export default function ResumeParserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleProcessResume = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Assuming backend runs on 8000
      const response = await fetch('http://localhost:8000/api/candidates/upload-resume', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to process resume");
      }
      
      setParsedData(data.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4 text-center mb-12">
           <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
             <Sparkles className="h-4 w-4" />
             <span className="text-xs font-bold uppercase tracking-wider">Gemini 1.5 Intelligence</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tight">AI Resume Parser</h1>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
             Upload your resume and watch our intelligent engine instantly extract your career DNA.
           </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!parsedData ? (
            <motion.div 
              key="upload-zone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <div 
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5 shadow-[0_0_50px_rgba(var(--primary),0.1)]' : 'border-border/50 bg-secondary/10 hover:border-primary/50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  className="hidden" 
                />
                
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-8">
                    <div className="relative">
                       <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                       <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Decoding your professional journey...</h3>
                      <p className="text-muted-foreground">Extracting skills, experience, and education via AI</p>
                    </div>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-8">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{file.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex space-x-4">
                       <button onClick={resetState} className="px-6 py-3 rounded-xl border border-border bg-background hover:bg-secondary font-medium transition-colors">
                         Cancel
                       </button>
                       <button onClick={handleProcessResume} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all">
                         Analyze Resume
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6 py-12">
                    <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Drag & drop your resume</h3>
                      <p className="text-sm text-muted-foreground mt-2">Only PDF files are supported up to 5MB</p>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 rounded-xl bg-foreground text-background font-bold hover:scale-105 transition-transform shadow-xl">
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm font-medium">
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Personal Info & Skills */}
              <div className="space-y-8">
                {/* Profile Card */}
                <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <div className="flex items-center space-x-4 mb-6 relative z-10">
                     <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-black">
                        {parsedData.personal_info?.name?.charAt(0) || "U"}
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold">{parsedData.personal_info?.name || "Candidate Name"}</h2>
                        <p className="text-muted-foreground text-sm flex items-center mt-1">
                          {parsedData.personal_info?.location || "Location Unknown"}
                        </p>
                     </div>
                   </div>
                   <div className="space-y-3 text-sm relative z-10">
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium text-right">{parsedData.personal_info?.email || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/30">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium text-right">{parsedData.personal_info?.phone || "N/A"}</span>
                      </div>
                   </div>
                </div>

                {/* Skills Card */}
                <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl">
                   <div className="flex items-center space-x-3 mb-6">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary"><Code className="h-5 w-5" /></div>
                     <h3 className="text-lg font-bold">Extracted Skills</h3>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {parsedData.skills && parsedData.skills.length > 0 ? (
                       parsedData.skills.map((skill: string, idx: number) => (
                         <span key={idx} className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium border border-border/50">
                           {skill}
                         </span>
                       ))
                     ) : (
                       <p className="text-sm text-muted-foreground">No skills detected.</p>
                     )}
                   </div>
                </div>
                
                <button onClick={resetState} className="w-full px-6 py-4 rounded-xl border border-border bg-background hover:bg-secondary font-bold transition-colors flex items-center justify-center space-x-2">
                  <UploadCloud className="h-5 w-5" />
                  <span>Parse Another Resume</span>
                </button>
              </div>

              {/* Right Column: Summary, Experience, Education */}
              <div className="lg:col-span-2 space-y-8">
                 {/* Summary */}
                 <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl">
                   <div className="flex items-center space-x-3 mb-4">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="h-5 w-5" /></div>
                     <h3 className="text-lg font-bold">AI Professional Summary</h3>
                   </div>
                   <p className="text-muted-foreground leading-relaxed">
                     {parsedData.summary || "No summary available."}
                   </p>
                 </div>

                 {/* Experience */}
                 <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl">
                   <div className="flex items-center space-x-3 mb-6">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary"><Briefcase className="h-5 w-5" /></div>
                     <h3 className="text-lg font-bold">Experience Timeline</h3>
                   </div>
                   <div className="space-y-6">
                     {parsedData.experience && parsedData.experience.length > 0 ? (
                       parsedData.experience.map((exp: any, idx: number) => (
                         <div key={idx} className="relative pl-6 border-l-2 border-border/50 pb-6 last:pb-0">
                           <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                           <h4 className="text-xl font-bold">{exp.title}</h4>
                           <div className="flex items-center justify-between mt-1 mb-3">
                             <p className="text-primary font-medium">{exp.company}</p>
                             <p className="text-sm text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-md">
                               {exp.start_date} - {exp.end_date}
                             </p>
                           </div>
                           <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                         </div>
                       ))
                     ) : (
                       <p className="text-sm text-muted-foreground">No experience detected.</p>
                     )}
                   </div>
                 </div>

                 {/* Education */}
                 <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-xl">
                   <div className="flex items-center space-x-3 mb-6">
                     <div className="p-2 bg-primary/10 rounded-lg text-primary"><GraduationCap className="h-5 w-5" /></div>
                     <h3 className="text-lg font-bold">Education</h3>
                   </div>
                   <div className="space-y-4">
                     {parsedData.education && parsedData.education.length > 0 ? (
                       parsedData.education.map((edu: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-start p-4 rounded-xl bg-secondary/30 border border-border/30">
                           <div>
                             <h4 className="font-bold">{edu.degree}</h4>
                             <p className="text-sm text-muted-foreground">{edu.institution}</p>
                           </div>
                           <span className="text-xs font-bold px-2 py-1 bg-background rounded-md border border-border">{edu.graduation_year}</span>
                         </div>
                       ))
                     ) : (
                       <p className="text-sm text-muted-foreground">No education detected.</p>
                     )}
                   </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
