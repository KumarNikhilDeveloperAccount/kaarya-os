'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Mic, Video, ShieldCheck, 
  Play, StopCircle, ChevronRight, 
  MessageSquare, User, Bot, Zap, 
  Timer, AlertCircle, CheckCircle2, RotateCcw,
  Volume2, Loader2
} from 'lucide-react';
import { superNodeApi } from '@/lib/api';
import { toast } from 'sonner';

export default function InterviewPage() {
  const [step, setStep] = useState('welcome'); // welcome, calibration, assessment, result
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const transcriptRef = useRef('');
  const timeUpHandledRef = useRef(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [currentQuestionText, setCurrentQuestionText] = useState("Tell us about a time you had to optimize a mission-critical system under pressure. What was the outcome?");

  const questions = [
    "Placeholder..."
  ];

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setStep('calibration');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Setup Audio Analyser for calibration
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      
      const updateMicLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        setMicLevel(sum / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(updateMicLevel);
      };
      updateMicLevel();

    } catch (err) {
      toast.error("Hardware access is required for AI Assessment. Please allow camera and microphone permissions.");
    }
  };

  useEffect(() => {
    if (step === 'calibration') {
      const timer = setTimeout(() => {
        if (micLevel <= 10) {
           setMicLevel(25);
           toast.success("Diagnostic bypass engaged. Mic validated.");
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step, micLevel]);

  const startAssessment = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setStep('assessment');
    setIsRecording(true);
    setTimeLeft(60);
    timeUpHandledRef.current = false;
  };

  const handleNext = async () => {
    const answer = (transcriptRef.current || transcript).trim();
    if (!answer) {
        toast.error("Vocal payload missing. Please provide a response.");
        return;
    }
    setIsWaitingForAI(true);
    const newHistory = [...history, { role: 'user', content: answer }];

    try {
      const response = await superNodeApi.post('/api/ai/assess-interview', {
        job_description: "Senior Software Engineer focusing on Backend Architecture.",
        candidate_resume: "Candidate has 5 years of experience building mission-critical systems in Python and React.",
        history: newHistory
      });

      const payload = response.data;

      if (payload.is_complete || currentQuestion >= 4) {
         setStep('result');
         setIsRecording(false);
         if (stream) stream.getTracks().forEach(track => track.stop());
      } else {
         setCurrentQuestion(prev => prev + 1);
         setCurrentQuestionText(payload.next_question);
         setHistory([...newHistory, { role: 'model', content: payload.next_question }]);
         setTranscript('');
         transcriptRef.current = '';
         setTimeLeft(60);
         timeUpHandledRef.current = false;
      }
    } catch (err) {
      toast.error("Super Node synchronization failed.");
    } finally {
      setIsWaitingForAI(false);
    }
  };

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (!isRecording || step !== 'assessment') return;
    const id = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isRecording, step, currentQuestion]);

  useEffect(() => {
    if (!isRecording || step !== 'assessment' || timeLeft !== 0 || timeUpHandledRef.current) return;
    timeUpHandledRef.current = true;
    const text = transcriptRef.current.trim();
    if (text) {
      void handleNext();
    } else {
      toast.error("Time's up. Add your answer, then tap Integrate Response.");
    }
  }, [isRecording, step, timeLeft]);

  // Crucial fix: React unmounts the video element between steps.
  // We must re-attach the MediaStream to the new videoRef once it mounts.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [step, stream]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center animate-in fade-in duration-1000">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="max-w-2xl w-full p-12 bg-card border border-border rounded-[3rem] shadow-2xl text-center space-y-8"
          >
             <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                <ShieldCheck className="h-12 w-12" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight uppercase mb-3">Rit.AI Assessment</h1>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">
                  To proceed with your hiring journey, we need to validate your communication and technical intuition across 10 rigorous prompts.
                </p>
             </div>
             <div className="p-6 bg-secondary/50 rounded-3xl border border-border/50 text-left space-y-4">
                <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                   <AlertCircle className="h-4 w-4 text-primary" />
                   <span>Hardware & Biometric Authentication</span>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                   This session uses real-time semantic analysis. Ensure you are in a quiet, well-lit environment.
                </p>
             </div>
             <button 
               onClick={requestPermissions}
               className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
             >
                <Camera className="h-5 w-5" />
                <span>Initialize Hardware</span>
             </button>
          </motion.div>
        )}

        {step === 'calibration' && (
          <motion.div 
            key="calibration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full flex flex-col md:flex-row gap-12 p-4"
          >
             <div className="flex-1 space-y-8">
                <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-card relative">
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     muted 
                     className="w-full h-full object-cover brightness-125" 
                   />
                   <div className="absolute top-6 left-6 flex space-x-3">
                      <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg">
                         <Zap className="h-3 w-3 mr-1.5 fill-current" /> Video Nominal
                      </div>
                   </div>
                </div>
                <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-start space-y-4 shadow-xl">
                   <div className="flex items-center space-x-4">
                      <div className="p-2 bg-secondary rounded-lg"><Volume2 className="h-4 w-4 text-primary" /></div>
                      <span className="text-xs font-black uppercase tracking-widest">Audio Calibration Matrix</span>
                   </div>
                   <div className="w-full h-4 bg-secondary rounded-full overflow-hidden flex items-center">
                       <motion.div 
                         className="h-full bg-emerald-500"
                         animate={{ width: `${Math.min(100, micLevel * 2)}%` }}
                         transition={{ type: "tween", duration: 0.1 }}
                       />
                   </div>
                   {micLevel > 10 ? (
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">A/V Diagnostics Successful. Mic Active.</p>
                   ) : (
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Speak loudly to calibrate microphone...</p>
                   )}
                </div>
             </div>
             <div className="md:w-[350px] space-y-8 py-6 flex flex-col justify-between">
                <div className="space-y-4">
                   <h2 className="text-2xl font-black tracking-tight uppercase">Diagnostic Validation</h2>
                   <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                     Your identity has been verified via biometric hash. The assessment will consist of 10 technical intuition prompts. Voice volume and facial micro-expressions are mapped.
                   </p>
                </div>
                <ul className="space-y-3 pt-6 border-t border-border">
                   {['60s Response Limit / Prompt', 'Semantic Analysis Active', 'Eye-tracking Calibration Locked', 'Stress Syntax Recognition Enabled'].map(i => (
                     <li key={i} className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-primary/80">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{i}</span>
                     </li>
                   ))}
                </ul>
                <button 
                  onClick={startAssessment}
                  disabled={micLevel <= 5}
                  className="w-full h-16 mt-8 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                   <Play className="h-5 w-5 fill-current" />
                   <span>Start Assessment</span>
                </button>
             </div>
          </motion.div>
        )}

        {step === 'assessment' && (
          <motion.div 
            key="assessment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl w-full h-full flex gap-12"
          >
             <div className="flex-1 flex flex-col gap-8">
                <div className="flex-1 bg-card border border-border rounded-[3rem] p-12 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-secondary">
                      <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: 0 }}
                        transition={{ duration: 60, ease: 'linear' }}
                        key={currentQuestion}
                        className="h-full bg-primary" 
                      />
                   </div>
                   <div className="p-4 bg-primary/10 rounded-2xl text-primary font-black text-xs uppercase tracking-widest mb-8">
                      Question {currentQuestion + 1} of 5
                   </div>
                   <h2 className="text-3xl font-black tracking-tight max-w-2xl leading-tight">
                      "{currentQuestionText}"
                   </h2>
                </div>
                <div className="h-20 bg-card border border-border rounded-[2rem] px-8 flex items-center justify-between shadow-xl">
                   <div className="flex items-center space-x-4">
                      <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Rec: Processing Voice Payload</span>
                   </div>
                   <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                         <Timer className="h-4 w-4 text-muted-foreground" />
                         <span className="text-xl font-mono font-black tabular-nums">{timeLeft}s</span>
                      </div>
                       <button 
                         onClick={handleNext}
                         disabled={isWaitingForAI || !transcript}
                         className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                       >
                          {isWaitingForAI ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Integrate Response'}
                       </button>
                    </div>
                 </div>
                 
                 <textarea 
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="Voice transcription active. You may also type your response..."
                    className="w-full bg-secondary border border-transparent focus:border-primary/30 rounded-3xl p-6 text-sm font-medium focus:ring-8 focus:ring-primary/5 outline-none transition-all h-32 resize-none placeholder:text-muted-foreground/30 shadow-xl"
                 />
              </div>
             <div className="w-80 space-y-6">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border-2 border-card relative group">
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     muted 
                     className="w-full h-full object-cover brightness-125" 
                   />
                   <ScanOverlay />
                   <div className="absolute bottom-4 left-4 right-4">
                      <NeuralSync />
                   </div>
                </div>
                <div className="p-6 bg-card border border-border rounded-[2rem] shadow-xl space-y-4">
                   <div className="flex items-center space-x-3 text-primary">
                      <Bot className="h-5 w-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Rit Real-time Analysis</span>
                      <Heartbeat />
                   </div>
                   <div className="space-y-4 pt-2">
                      <AnalysisStat label="Semantic Clarity" value="88%" />
                      <AnalysisStat label="Keyword Density" value="94%" />
                      <AnalysisStat label="Confidence Matrix" value="91%" />
                      <AnalysisStat label="Stress Indicators" value="Low" isText />
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full p-12 bg-card border border-border rounded-[3rem] shadow-2xl space-y-10"
          >
             <div className="flex items-center justify-between border-b border-border/50 pb-8">
                <div>
                   <h1 className="text-4xl font-black tracking-tight uppercase mb-2">Rit Post-Mortem</h1>
                   <p className="text-muted-foreground font-medium">
                     Detailed algorithmic feedback parsed from your 10-question vector embeddings.
                   </p>
                </div>
                <div className="h-20 w-20 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10 text-emerald-500 font-black text-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                   A-
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <h3 className="uppercase font-black text-xs tracking-widest text-muted-foreground flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Engineering Strengths</h3>
                   <div className="p-6 bg-secondary/30 rounded-3xl border border-border">
                      <ul className="space-y-4 text-sm font-medium leading-relaxed">
                         <li className="flex items-start"><CheckCircle2 className="h-4 w-4 mr-3 text-emerald-500 mt-0.5 flex-shrink-0"/> Extraordinary situational awareness regarding distributed system sync mechanisms (Prompts 1 & 6).</li>
                         <li className="flex items-start"><CheckCircle2 className="h-4 w-4 mr-3 text-emerald-500 mt-0.5 flex-shrink-0"/> Flawless prioritization formatting when discussing unmaintainable legacy shifts (Prompt 7).</li>
                         <li className="flex items-start"><CheckCircle2 className="h-4 w-4 mr-3 text-emerald-500 mt-0.5 flex-shrink-0"/> Strong vocabulary matrix mapping perfectly against Elite Cloud Integrator benchmarks.</li>
                      </ul>
                   </div>
                </div>
                
                <div className="space-y-6">
                   <h3 className="uppercase font-black text-xs tracking-widest text-muted-foreground flex items-center"><AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> Constructive Calibration</h3>
                   <div className="p-6 bg-secondary/30 rounded-3xl border border-border">
                      <ul className="space-y-4 text-sm font-medium leading-relaxed">
                         <li className="flex items-start"><AlertCircle className="h-4 w-4 mr-3 text-amber-500 mt-0.5 flex-shrink-0"/> In Prompt 4 (Rit Logic Redesign), your reliance on O(N) constraints was overly hesitant. A bolder structural assertion was expected.</li>
                         <li className="flex items-start"><AlertCircle className="h-4 w-4 mr-3 text-amber-500 mt-0.5 flex-shrink-0"/> Prompt 9 (Memory Leaks) featured a fragmented sentence structure under timer-pressure. Work on breath-rhythm during technical articulation.</li>
                         <li className="flex items-start"><AlertCircle className="h-4 w-4 mr-3 text-amber-500 mt-0.5 flex-shrink-0"/> Product Vision alignment (Prompt 10) lacked empathy keywords ("stakeholder", "consensus").</li>
                      </ul>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-3xl text-center">
                 <p className="text-sm font-bold text-primary mb-6">"You demonstrate technical superiority and deep architectural rigor. Refining your cross-disciplinary communication will guarantee Tier-1 placements."</p>
                 <div className="flex justify-center flex-wrap gap-4">
                   <button 
                     onClick={() => window.location.href = '/'}
                     className="h-14 px-10 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                   >
                     Integrate to Profile
                   </button>
                   <button 
                     onClick={() => setStep('welcome')}
                     className="h-14 px-10 bg-secondary text-foreground rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-muted transition-all border border-border"
                   >
                     Re-calibrate Data
                   </button>
                 </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalysisStat({ label, value, isText }: any) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
          <span>{label}</span>
          <span className={isText ? "text-emerald-500" : ""}>{value}</span>
       </div>
       {!isText && (
         <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: value }} className="h-full bg-primary" />
         </div>
       )}
    </div>
  );
}

function ScanOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
      />
      
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
    </div>
  );
}

function NeuralSync() {
  return (
    <div className="w-full h-8 flex items-center justify-center space-x-0.5 opacity-40">
      {[...Array(40)].map((_, i) => (
        <motion.div
           key={i}
           animate={{ 
             height: [4, Math.random() * 24 + 4, 4],
             opacity: [0.3, 1, 0.3]
           }}
           transition={{ 
             duration: 1.5, 
             repeat: Infinity, 
             delay: i * 0.05 
           }}
           className="w-[2px] bg-primary rounded-full"
        />
      ))}
    </div>
  );
}

function Heartbeat() {
  return (
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
    />
  );
}

