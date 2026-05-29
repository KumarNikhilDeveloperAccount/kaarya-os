'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, User, Briefcase, GraduationCap, 
  Settings, ChevronRight, CheckCircle2, 
  Plus, Trash2, Mail, Globe, MapPin, 
  Sparkles, Bot, Save, Download, Play, Upload
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ResumePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  
  // Real State to render AI extraction
  const [jd, setJd] = useState('Senior Software Engineer focusing on Backend Architecture, Python, Next.js, and Cloud Infrastructure.');
  const [rawResume, setRawResume] = useState('Kumar Nikhil. Founded NikVerse AI. 4 years of experience building massive distributed systems using FastAPI, Postgres, and NextJS. Graduated Stanford 2024.');
  const [aiOpinion, setAiOpinion] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any>({
    personal: { name: '', email: '', location: '', objective: '' },
    experience: [],
    skills: [],
    education: []
  });

  const steps = [
    { id: 'setup', name: 'Context', icon: Play },
    { id: 'personal', name: 'Identity', icon: User },
    { id: 'experience', name: 'Legacy', icon: Briefcase },
    { id: 'skills', name: 'Specialties', icon: Settings },
    { id: 'education', name: 'Foundation', icon: GraduationCap }
  ];

  const handleParse = async () => {
    if (!jd || !rawResume) {
       toast.error("Both Job Description and Resume Text are required.");
       return;
    }
    
    setIsParsing(true);
    try {
      const response = await api.post('/api/ai/parse-resume', {
         resume_text: rawResume,
         job_description: jd
      });
      
      const payload = response.data;
      
      // Update state with AI JSON
      setParsedData({
         personal: { 
           name: payload.personal?.name || 'Unknown', 
           email: payload.personal?.email || '', 
           location: payload.personal?.location || '', 
           objective: payload.personal?.objective || ''
         },
         experience: payload.experience || [],
         skills: payload.skills || [],
         education: payload.education || []
      });
      
      setAiOpinion(payload.rit_analysis);
      toast.success('Rit AI Analysis Complete');
      setActiveStep(1); // Move to Identity Step
      
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "AI Parsing failed");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Builder Panel */}
        <div className="flex-1 space-y-10">
          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3 text-primary">
                <FileText className="h-8 w-8" />
                <div>
                   <h1 className="text-3xl font-black tracking-tight uppercase">Resume Architect</h1>
                   <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground/60 uppercase">Powered by Rit.AI v4.2</p>
                </div>
             </div>
             
             {activeStep > 0 && (
                 <button 
                   onClick={handleParse}
                   disabled={isParsing}
                   className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                 >
                    {isParsing ? <Bot className="h-4 w-4 animate-bounce" /> : <Sparkles className="h-4 w-4" />}
                    <span>{isParsing ? 'Rit Analyzing...' : 'Re-Extract (AI)'}</span>
                 </button>
             )}
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between bg-card border border-border p-2 rounded-[2rem] shadow-xl">
             {steps.map((step, idx) => (
               <button 
                 key={step.id}
                 onClick={() => setActiveStep(idx)}
                 className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-[1.5rem] transition-all ${
                   activeStep === idx 
                   ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10' 
                   : 'text-muted-foreground hover:bg-secondary'
                 }`}
               >
                  <step.icon className={`h-5 w-5 ${activeStep === idx ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{step.name}</span>
                  {idx < activeStep && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
               </button>
             ))}
          </div>

          {/* Form Area */}
          <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl p-10 min-h-[500px] flex flex-col relative overflow-hidden">
             {isParsing && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                   <Bot className="h-16 w-16 text-primary animate-bounce mb-4" />
                   <p className="text-xl font-black uppercase tracking-widest text-primary">Rit is Thinking...</p>
                   <p className="text-xs text-muted-foreground mt-2 font-bold tracking-widest uppercase">Executing Deep Semantic Extraction</p>
                </div>
             )}

             <AnimatePresence mode="wait">
                {activeStep === 0 && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-2">Target Job Description</label>
                         <textarea 
                            value={jd} onChange={(e) => setJd(e.target.value)}
                            className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-3xl p-6 text-sm font-medium focus:ring-8 focus:ring-primary/5 outline-none transition-all h-24 resize-none placeholder:text-muted-foreground/30" 
                            placeholder="Paste the Job Description here..." 
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-2 flex justify-between">
                            <span>Raw Resume Content</span>
                            <span className="text-muted-foreground">Or Upload PDF (Coming Soon)</span>
                         </label>
                         <textarea 
                            value={rawResume} onChange={(e) => setRawResume(e.target.value)}
                            className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-3xl p-6 text-sm font-medium focus:ring-8 focus:ring-primary/5 outline-none transition-all h-48 resize-none placeholder:text-muted-foreground/30" 
                            placeholder="Paste candiate text here..." 
                         />
                      </div>
                      <button 
                        onClick={handleParse} disabled={isParsing}
                        className="w-full h-16 bg-gradient-to-r from-primary to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-sm disabled:opacity-50"
                      >
                         <Sparkles className="h-5 w-5" />
                         <span>Deploy Rit Engine</span>
                      </button>
                   </motion.div>
                )}
                {activeStep === 1 && <PersonalInfoForm data={parsedData.personal} />}
                {activeStep === 2 && <ExperienceForm data={parsedData.experience} />}
                {activeStep === 3 && <SkillsForm data={parsedData.skills} />}
                {activeStep === 4 && <EducationForm data={parsedData.education} />}
             </AnimatePresence>

             {activeStep > 0 && (
                <div className="mt-auto pt-10 border-t border-border/50 flex justify-between items-center">
                    <button 
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="px-6 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all disabled:opacity-20"
                    >
                    Previous Phase
                    </button>
                    <div className="flex space-x-3">
                    <button className="p-3 rounded-xl bg-secondary hover:bg-muted text-muted-foreground transition-all">
                        <Save className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={() => activeStep < 4 && setActiveStep(prev => prev + 1)}
                        className="px-10 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        {activeStep === 4 ? 'Finalize Portfolio' : 'Next Integration'}
                    </button>
                    </div>
                </div>
             )}
          </div>
        </div>

        {/* Intelligence / Preview Preview */}
        <div className="lg:w-[400px] space-y-8">
           {aiOpinion ? (
              <div className="p-8 bg-gradient-to-br from-primary via-blue-600 to-indigo-600 rounded-[2.5rem] text-white shadow-[0_20px_50px_rgba(59,130,246,0.3)]">
                 <div className="flex items-start justify-between mb-8">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                       <Bot className="h-6 w-6" />
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 font-black text-xs border border-white/20">
                       {aiOpinion.fit_score || 'N/A'}
                    </div>
                 </div>
                 <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">Rit.AI Opinion</h3>
                 <p className="text-sm font-medium text-white/80 leading-relaxed mb-6">
                   {aiOpinion.summary || "Analysis perfectly mapped."}
                 </p>
                 <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 space-y-3">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span>ATS Match Check</span>
                          <span>{aiOpinion.fit_score || 0}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${aiOpinion.fit_score || 0}%` }} className="h-full bg-emerald-400" />
                       </div>
                    </div>
                    
                    {aiOpinion.missing_keywords && aiOpinion.missing_keywords.length > 0 && (
                       <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-red-200">Missing Critical Keywords</p>
                          <div className="flex flex-wrap gap-2">
                             {aiOpinion.missing_keywords.map((k: string) => (
                               <span key={k} className="px-2 py-1 bg-red-500/30 rounded text-[10px] font-bold">{k}</span>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           ) : (
              <div className="p-8 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center h-[300px] text-center bg-card/50">
                 <Bot className="h-10 w-10 text-muted-foreground/30 mb-4" />
                 <p className="text-xs uppercase font-black tracking-widest text-muted-foreground">Awaiting Input Context</p>
              </div>
           )}

           <div className="relative group cursor-zoom-in">
              <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all" />
              <div className="relative bg-white text-black p-8 rounded-[2rem] aspect-[1/1.4] shadow-2xl scale-95 group-hover:scale-100 transition-all duration-700">
                 <div className="border-b-2 border-primary pb-4 mb-6">
                    <h4 className="text-xl font-black uppercase tracking-tight">{parsedData.personal.name || 'Candidate Name'}</h4>
                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mt-1">AI Structured Format</p>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="h-2 w-24 bg-zinc-200 rounded" />
                       <div className="h-1.5 w-full bg-zinc-100 rounded" />
                       <div className="h-1.5 w-4/5 bg-zinc-100 rounded" />
                    </div>
                    <div className="space-y-2">
                       <div className="h-2 w-32 bg-zinc-200 rounded" />
                       <div className="h-1.5 w-full bg-zinc-100 rounded" />
                       <div className="h-1.5 w-full bg-zinc-100 rounded" />
                    </div>
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 bg-black text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="h-5 w-5" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PersonalInfoForm({ data }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputGroup label="Full Portfolio Identity" placeholder="Jane Doe" icon={User} val={data.name} />
          <InputGroup label="Primary Digital Reach" placeholder="jane@example.com" icon={Mail} val={data.email} />
          <InputGroup label="Global Location" placeholder="San Francisco, CA" icon={MapPin} val={data.location} />
          <InputGroup label="Digital Network" placeholder="github.com/janedoe" icon={Globe} val="" />
       </div>
       <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Legacy Overview</label>
          <textarea 
            defaultValue={data.objective}
            className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-3xl p-6 text-sm font-medium focus:ring-8 focus:ring-primary/5 outline-none transition-all h-32 resize-none" 
          />
       </div>
    </motion.div>
  );
}

function ExperienceForm({ data }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
       <div className="p-8 border border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center text-center group hover:bg-secondary/20 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Plus className="h-8 w-8" />
          </div>
          <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Integrate New Workforce Experience</p>
       </div>
       
       {data && data.length > 0 ? data.map((exp: any, idx: number) => (
         <ExperienceItem 
            key={idx}
            role={exp.title || 'Role'} 
            company={exp.company || 'Company'} 
            period={exp.duration || 'Duration'} 
            desc={exp.description || 'Description'} 
         />
       )) : (
         <ExperienceItem role="Founding Engineer" company="NikVerse AI" period="2024 - Present" desc="Leading infrastructure architecture and high-performance system design." />
       )}
    </motion.div>
  );
}

function SkillsForm({ data }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data && data.length > 0 ? data.map((skill: string) => (
            <div key={skill} className="flex items-center justify-between p-4 bg-secondary/40 border border-border/20 rounded-2xl group border-l-4 border-l-primary">
               <span className="text-sm font-bold tracking-tight">{skill}</span>
               <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors" />
            </div>
          )) : (
             <div className="p-4 border border-dashed border-border rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-widest text-muted-foreground">No Skills Extracted</div>
          )}
          <div className="p-4 border border-dashed border-border rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary/40 cursor-text transition-all">
             <Plus className="h-4 w-4 mr-2" /> Add Skill Spec
          </div>
       </div>
    </motion.div>
  );
}

function EducationForm({ data }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
       {data && data.length > 0 ? data.map((edu: any, idx: number) => (
         <ExperienceItem 
           key={idx}
           role={edu.degree || 'Degree'} 
           company={edu.institution || 'Institution'} 
           period={edu.year || 'Year'} 
           desc="Educational background extracted from resume." 
           isEdu
         />
       )) : (
         <ExperienceItem role="Computer Science" company="Stanford Academy" period="2024" desc="Focused on Artificial Intelligence." isEdu />
       )}
    </motion.div>
  );
}

function InputGroup({ label, placeholder, icon: Icon, val }: any) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">{label}</label>
       <div className="relative">
          <Icon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input defaultValue={val} className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:ring-8 focus:ring-primary/5 outline-none transition-all placeholder:opacity-50" placeholder={placeholder} />
       </div>
    </div>
  );
}

function ExperienceItem({ role, company, period, desc, isEdu }: any) {
  return (
    <div className="p-8 bg-secondary/20 border border-border/50 rounded-3xl relative group hover:border-primary/20 transition-all">
       <div className="flex justify-between items-start mb-4">
          <div>
             <h4 className="text-xl font-black uppercase tracking-tight">{role}</h4>
             <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1 opacity-80">{company} • {period}</p>
          </div>
          <div className="flex space-x-2">
             <div className="p-2 bg-card border border-border rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-secondary">
                <Settings className="h-4 w-4 text-muted-foreground" />
             </div>
             <div className="p-2 bg-card border border-border rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-500/10 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
             </div>
          </div>
       </div>
       <p className="text-sm text-muted-foreground font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
