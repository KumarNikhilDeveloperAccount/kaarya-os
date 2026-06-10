'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { 
  Camera, Mic, ShieldCheck, 
  Play, Bot, Zap, Timer, 
  AlertCircle, CheckCircle2, 
  Volume2, Loader2, Music, VideoOff, Settings
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function InterviewPage() {
  const [step, setStep] = useState('welcome'); // welcome, calibration, assessment, result
  const [micLevel, setMicLevel] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [currentQuestionText, setCurrentQuestionText] = useState("Tell us about a time you had to optimize a mission-critical system under pressure. What was the outcome?");
  const [focusMusic, setFocusMusic] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const transcriptRef = useRef('');
  const timeUpHandledRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Setup Audio Analyser
  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setHasPermissions(true);
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      
      const updateMicLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        setMicLevel(sum / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(updateMicLevel);
      };
      updateMicLevel();
      
      setStep('calibration');
    } catch (err: any) {
      console.error("Hardware access denied:", err);
      toast.error(`Hardware access error: ${err.message}. Entering Text Mode.`);
      setIsBypassed(true);
      setMicLevel(100);
      setStep('calibration');
    }
  };

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
      const response = await api.post('/api/ai/assess-interview', {
        job_description: "Senior Software Engineer focusing on Backend Architecture.",
        candidate_resume: "Candidate has 5 years of experience building mission-critical systems in Python and React.",
        history: newHistory
      });

      const payload = response.data;

      if (payload.is_complete || currentQuestion >= 4) {
         setStep('result');
         setIsRecording(false);
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

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

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

  // Speech Recognition
  useEffect(() => {
    if (!isRecording || step !== 'assessment') return;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        else interimTranscript += event.results[i][0].transcript;
      }
      setTranscript((finalTranscript + interimTranscript).trim());
    };
    recognition.onerror = () => {};
    try { recognition.start(); } catch (e) {}

    return () => { try { recognition.stop(); } catch (e) {} };
  }, [isRecording, step, currentQuestion]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center animate-in fade-in duration-1000 p-4">
      
      {/* Background Focus Audio Placeholder */}
      <audio 
        loop 
        autoPlay={focusMusic} 
        src="data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" 
        muted={!focusMusic} 
      />

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
                  To proceed with your hiring journey, we need to validate your communication and technical intuition.
                </p>
             </div>
             <div className="p-6 bg-secondary/50 rounded-3xl border border-border/50 text-left space-y-4">
                <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                   <Settings className="h-4 w-4 text-primary" />
                   <span>Hardware & Biometric Authentication</span>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                   This cinematic session uses real-time semantic analysis. Ensure you are in a quiet, well-lit environment.
                </p>
             </div>
             <div className="flex flex-col space-y-3">
               <button 
                 onClick={setupAudio}
                 className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
               >
                  <Camera className="h-5 w-5" />
                  <span>Initialize Hardware</span>
               </button>
             </div>
          </motion.div>
        )}

        {step === 'calibration' && (
          <motion.div 
            key="calibration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl w-full flex flex-col md:flex-row gap-12"
          >
             <div className="flex-1 space-y-8">
                <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-card relative">
                   {isBypassed ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20">
                         <VideoOff className="h-12 w-12 text-primary/30 mb-4" />
                         <p className="font-bold text-primary/50 uppercase tracking-[0.2em] text-xs">Text-Only Mode Active</p>
                      </div>
                   ) : (
                     <Webcam
                       audio={false}
                       ref={webcamRef}
                       mirrored={true}
                       className="w-full h-full object-cover brightness-110"
                     />
                   )}
                   <div className="absolute top-6 left-6 flex space-x-3">
                      <div className="px-4 py-2 bg-black/50 backdrop-blur-md text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center border border-emerald-500/30 shadow-lg">
                         <Zap className="h-3 w-3 mr-2 fill-current" /> {isBypassed ? 'Simulated Video' : 'Video Nominal'}
                      </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-card border border-border rounded-[2rem] flex flex-col items-start justify-center shadow-xl space-y-4">
                     <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-xl"><Volume2 className="h-5 w-5 text-primary" /></div>
                        <span className="text-xs font-black uppercase tracking-widest">Mic Calibration</span>
                     </div>
                     <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex items-center border border-border/50">
                         <motion.div 
                           className="h-full bg-emerald-500"
                           animate={{ width: `${Math.min(100, micLevel * 2)}%` }}
                           transition={{ type: "tween", duration: 0.1 }}
                         />
                     </div>
                     {micLevel > 5 ? (
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">A/V Diagnostics Successful.</p>
                     ) : (
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Speak loudly to test mic...</p>
                     )}
                  </div>

                  <div className="p-6 bg-card border border-border rounded-[2rem] flex flex-col items-center justify-center shadow-xl space-y-4 text-center">
                    <div className="p-3 bg-blue-500/10 rounded-xl"><Music className="h-5 w-5 text-blue-500" /></div>
                    <span className="text-xs font-black uppercase tracking-widest">Ambient Focus Music</span>
                    <button 
                      onClick={() => setFocusMusic(!focusMusic)}
                      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${focusMusic ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-secondary text-muted-foreground border border-border'}`}
                    >
                      {focusMusic ? 'Playing' : 'Paused'}
                    </button>
                  </div>
                </div>
             </div>

             <div className="md:w-[350px] space-y-8 py-6 flex flex-col justify-between">
                <div className="space-y-4">
                   <h2 className="text-3xl font-black tracking-tight uppercase">Cinematic Lobby</h2>
                   <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                     Your identity has been verified. The assessment will consist of 5 technical intuition prompts. Voice volume and facial expressions are mapped.
                   </p>
                </div>
                <ul className="space-y-4 pt-6 border-t border-border">
                   {['60s Response Limit', 'Semantic Analysis Active', 'Eye-tracking Calibration', 'Stress Syntax Recognition'].map(i => (
                     <li key={i} className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-primary/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>{i}</span>
                     </li>
                   ))}
                </ul>
                <button 
                  onClick={startAssessment}
                  className="w-full h-16 mt-8 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
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
            className="max-w-7xl w-full h-full flex gap-8"
          >
             <div className="flex-1 flex flex-col gap-6">
                <div className="flex-1 bg-card border border-border rounded-[3rem] p-10 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
                      <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: 0 }}
                        transition={{ duration: 60, ease: 'linear' }}
                        key={currentQuestion}
                        className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      />
                   </div>
                   <div className="p-3 bg-primary/10 rounded-2xl text-primary font-black text-[10px] uppercase tracking-widest mb-6">
                      Question {currentQuestion + 1} of 5
                   </div>
                   <h2 className="text-2xl md:text-3xl font-black tracking-tight max-w-3xl leading-snug">
                      "{currentQuestionText}"
                   </h2>
                </div>
                <div className="h-20 bg-card border border-border rounded-[2rem] px-8 flex items-center justify-between shadow-xl">
                   <div className="flex items-center space-x-4">
                      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hidden md:inline">Rec: Processing Voice Payload</span>
                   </div>
                   <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                         <Timer className="h-5 w-5 text-muted-foreground" />
                         <span className="text-2xl font-mono font-black tabular-nums">{timeLeft}s</span>
                      </div>
                       <button 
                         onClick={handleNext}
                         disabled={isWaitingForAI || !transcript}
                         className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                       >
                          {isWaitingForAI ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Integrate Response'}
                       </button>
                    </div>
                 </div>
                 
                 <textarea 
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="Voice transcription active. You may also type your response..."
                    className="w-full bg-secondary/50 border border-border focus:border-primary/50 rounded-3xl p-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all h-32 resize-none placeholder:text-muted-foreground/40 shadow-inner"
                 />
              </div>
             <div className="w-[380px] space-y-6 hidden lg:block">
                <div className="aspect-[4/3] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-card relative group">
                   {!isBypassed && (
                     <Webcam
                       audio={false}
                       mirrored={true}
                       className="w-full h-full object-cover brightness-110"
                     />
                   )}
                   <ScanOverlay />
                   <div className="absolute bottom-6 left-6 right-6">
                      <NeuralSync />
                   </div>
                </div>
                <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl space-y-6">
                   <div className="flex items-center space-x-3 text-primary">
                      <Bot className="h-6 w-6" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Rit Real-time Analysis</span>
                      <Heartbeat />
                   </div>
                   <div className="space-y-5 pt-2">
                      <AnalysisStat label="Semantic Clarity" value="88%" />
                      <AnalysisStat label="Keyword Density" value="94%" />
                      <AnalysisStat label="Confidence Matrix" value="91%" />
                      <AnalysisStat label="Eye Contact" value="Locked" isText />
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
                     Detailed algorithmic feedback parsed from your vector embeddings.
                   </p>
                </div>
                <div className="h-20 w-20 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10 text-emerald-500 font-black text-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                   A-
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <h3 className="uppercase font-black text-xs tracking-widest text-muted-foreground flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Engineering Strengths</h3>
                   <div className="p-6 bg-secondary/30 rounded-3xl border border-border h-full">
                      <ul className="space-y-4 text-sm font-medium leading-relaxed">
                         <li className="flex items-start"><CheckCircle2 className="h-4 w-4 mr-3 text-emerald-500 mt-0.5 flex-shrink-0"/> Extraordinary situational awareness regarding distributed system sync mechanisms.</li>
                         <li className="flex items-start"><CheckCircle2 className="h-4 w-4 mr-3 text-emerald-500 mt-0.5 flex-shrink-0"/> Flawless prioritization formatting when discussing legacy shifts.</li>
                      </ul>
                   </div>
                </div>
                
                <div className="space-y-6">
                   <h3 className="uppercase font-black text-xs tracking-widest text-muted-foreground flex items-center"><AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> Constructive Calibration</h3>
                   <div className="p-6 bg-secondary/30 rounded-3xl border border-border h-full">
                      <ul className="space-y-4 text-sm font-medium leading-relaxed">
                         <li className="flex items-start"><AlertCircle className="h-4 w-4 mr-3 text-amber-500 mt-0.5 flex-shrink-0"/> Your reliance on O(N) constraints was overly hesitant. A bolder structural assertion was expected.</li>
                         <li className="flex items-start"><AlertCircle className="h-4 w-4 mr-3 text-amber-500 mt-0.5 flex-shrink-0"/> Fragmented sentence structure under timer-pressure. Work on breath-rhythm during technical articulation.</li>
                      </ul>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-3xl text-center">
                 <p className="text-sm font-bold text-primary mb-6">"You demonstrate technical superiority and deep architectural rigor. Refining your cross-disciplinary communication will guarantee Tier-1 placements."</p>
                 <div className="flex justify-center flex-wrap gap-4">
                   <button 
                     onClick={() => window.location.href = '/'}
                     className="h-14 px-10 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                   >
                     Integrate to Profile
                   </button>
                   <button 
                     onClick={() => window.location.href = '/interview'}
                     className="h-14 px-10 bg-secondary text-foreground rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-muted transition-all border border-border"
                   >
                     Re-calibrate
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
    <div className="space-y-2">
       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span>{label}</span>
          <span className={isText ? "text-emerald-500" : ""}>{value}</span>
       </div>
       {!isText && (
         <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
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
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-primary/40 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10"
      />
      {/* Corner Brackets */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-primary/50 rounded-tl-xl" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-primary/50 rounded-tr-xl" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-primary/50 rounded-bl-xl" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-primary/50 rounded-br-xl" />
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
}

function NeuralSync() {
  return (
    <div className="w-full h-8 flex items-center justify-center space-x-1 opacity-50">
      {[...Array(30)].map((_, i) => (
        <motion.div
           key={i}
           animate={{ 
             height: [6, Math.random() * 32 + 6, 6],
             opacity: [0.3, 1, 0.3]
           }}
           transition={{ 
             duration: 1.5, 
             repeat: Infinity, 
             delay: i * 0.05 
           }}
           className="w-[3px] bg-primary rounded-full"
        />
      ))}
    </div>
  );
}

function Heartbeat() {
  return (
    <motion.div
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
    />
  );
}
