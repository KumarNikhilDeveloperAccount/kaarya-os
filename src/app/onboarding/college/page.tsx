'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TagInput } from '@/components/ui/TagInput';
import { ProfileUpload } from '@/components/ui/ProfileUpload';
import { saveProfileData, fileToBase64 } from '@/lib/store';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function CollegeOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    collegeName: '',
    location: '',
    affiliation: '',
    logo: null as File | null,
    // Step 2
    degrees: [] as string[],
    streams: [] as string[],
    // Step 3
    placementOfficer: '',
    contactEmail: '',
    batchSize: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step === 1 && (!formData.collegeName || !formData.affiliation)) {
      toast.error('Institution Name and Affiliation are mandatory.');
      return;
    }
    if (step === 2 && (!formData.placementOfficer)) {
      toast.error('Placement Officer Name is mandatory.');
      return;
    }
    setStep(s => Math.min(4, s + 1));
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    if (formData.streams.length === 0) {
      toast.error('Please specify at least one stream/degree.');
      return;
    }
    setIsSubmitting(true);

    try {
      let logoBase64 = null;
      if (formData.logo) {
        logoBase64 = await fileToBase64(formData.logo);
      }

      const finalData = {
        ...formData,
        logo: logoBase64
      };

      saveProfileData('college', finalData);

      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#3b82f6', '#10b981']
      });
      toast.success("Institution profile created successfully!");
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast.error("Failed to save profile data.");
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderStepIndicator = () => {
    if (step === totalSteps) return null;
    return (
      <div className="flex items-center space-x-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`w-12 h-2 rounded-full transition-colors duration-500 ${i <= step ? 'bg-purple-500' : 'bg-purple-500/20'}`} />
          </div>
        ))}
        <span className="text-xs font-bold text-muted-foreground ml-2 uppercase tracking-widest">
          Step {step} of 3
        </span>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Institution Details</h2>
              <p className="text-muted-foreground">Register your college to connect with top recruiters.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">College / University Name</label>
                <input type="text" value={formData.collegeName} onChange={e => setFormData({...formData, collegeName: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="National Institute of Technology" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="City, State" />
                </div>
                <div>
                  <label className="text-sm font-semibold">University Affiliation</label>
                  <input type="text" value={formData.affiliation} onChange={e => setFormData({...formData, affiliation: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="E.g. Autonomous, State Univ" />
                </div>
              </div>
              <ProfileUpload 
                label="Institution Logo"
                value={formData.logo} 
                onChange={file => setFormData({...formData, logo: file})} 
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Programs Offered</h2>
              <p className="text-muted-foreground">What courses do your students specialize in?</p>
            </div>

            <div className="space-y-6">
              <TagInput 
                label="Degrees Offered" 
                placeholder="e.g. B.Tech, M.Tech, MCA, MBA" 
                tags={formData.degrees} 
                setTags={(tags) => setFormData({...formData, degrees: tags})} 
              />
              
              <TagInput 
                label="Key Streams / Branches" 
                placeholder="e.g. Computer Science, Electronics, Mechanical" 
                tags={formData.streams} 
                setTags={(tags) => setFormData({...formData, streams: tags})} 
              />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Placement Cell Details</h2>
              <p className="text-muted-foreground">Who should companies contact for campus hiring?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label className="text-sm font-semibold">Placement Officer Name</label>
                  <input type="text" value={formData.placementOfficer} onChange={e => setFormData({...formData, placementOfficer: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="John Doe" />
                 </div>
                 <div>
                  <label className="text-sm font-semibold">Contact Email</label>
                  <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" placeholder="placements@college.edu" />
                 </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-2 block">Average Batch Size (Annual)</label>
                <select value={formData.batchSize} onChange={e => setFormData({...formData, batchSize: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all appearance-none">
                  <option value="">Select Size</option>
                  <option value="<500">Less than 500</option>
                  <option value="500-1000">500 - 1,000</option>
                  <option value="1000-2000">1,000 - 2,000</option>
                  <option value="2000+">2,000+</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 flex flex-col items-center justify-center text-center py-12">
            <div className="relative">
               <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
               <div className="w-24 h-24 bg-purple-500 text-white rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-purple-500/40">
                 <GraduationCap className="w-12 h-12" />
               </div>
            </div>
            <div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter">Institution registered! 🎉</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your College profile is active. You can now track student progress and connect with partners.
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="w-full md:w-[400px] lg:w-[500px] bg-card border-r border-border p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         
         <div className="relative z-10">
           <div className="flex items-center space-x-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center overflow-hidden">
                <img src="/kaarya-logo-final.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tighter">Kaarya.OS</span>
           </div>

           <div className="space-y-8">
             <h3 className="text-2xl font-bold">Empower your students with data-driven placements.</h3>
             <div className="space-y-6">
                {[
                  { title: "Institution", desc: "Basic details" },
                  { title: "Programs", desc: "Degrees & streams" },
                  { title: "Placement Cell", desc: "Contact information" }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-500 ${step > idx + 1 ? 'bg-purple-500 text-white' : step === idx + 1 ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' : 'bg-muted text-muted-foreground'}`}>
                       {step > idx + 1 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                     </div>
                     <div>
                       <div className={`font-semibold transition-colors duration-500 ${step >= idx + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{s.title}</div>
                       <div className="text-xs text-muted-foreground">{s.desc}</div>
                     </div>
                  </div>
                ))}
             </div>
           </div>
         </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col items-center p-6 md:p-12 lg:p-20 overflow-y-auto bg-background/50">
        <div className="w-full max-w-2xl flex-1 flex flex-col">
          {renderStepIndicator()}
          
          <div className="flex-1 py-8">
             <AnimatePresence mode="wait">
               {renderStep()}
             </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-8 mt-auto border-t border-border flex items-center justify-between">
             {step < totalSteps && (
               <button
                 onClick={handleBack}
                 className={`px-6 py-3 font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center ${step === 1 ? 'invisible' : ''}`}
               >
                 <ArrowLeft className="w-4 h-4 mr-2" /> Back
               </button>
             )}
             
             {step < totalSteps - 1 ? (
               <button
                 onClick={handleNext}
                 className="px-8 py-3 bg-purple-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center shadow-lg shadow-purple-500/20 ml-auto"
               >
                 Next Step <ArrowRight className="w-4 h-4 ml-2" />
               </button>
             ) : step === totalSteps - 1 ? (
               <button
                 onClick={handleComplete}
                 disabled={isSubmitting}
                 className="px-8 py-3 bg-purple-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center shadow-lg shadow-purple-500/20 ml-auto disabled:opacity-70 disabled:hover:scale-100"
               >
                 {isSubmitting ? (
                   <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>Complete Setup <CheckCircle2 className="w-4 h-4 ml-2" /></>
                 )}
               </button>
             ) : (
               <button
                 onClick={() => router.push('/')}
                 className="w-full md:w-auto mx-auto px-12 py-4 bg-purple-500 text-white font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/25"
               >
                 Enter Kaarya.OS
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
