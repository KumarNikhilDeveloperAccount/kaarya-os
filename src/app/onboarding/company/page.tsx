'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TagInput } from '@/components/ui/TagInput';
import { ProfileUpload } from '@/components/ui/ProfileUpload';
import { saveProfileData, fileToBase64 } from '@/lib/store';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function CompanyOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    companyName: '',
    website: '',
    location: '',
    logo: null as File | null,
    // Step 2
    industry: '',
    companySize: '',
    bio: '',
    // Step 3
    rolesHired: [] as string[],
    techStack: [] as string[],
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
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

      saveProfileData('company', finalData);

      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#3b82f6', '#10b981']
      });
      toast.success("Company profile created successfully!");
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
            <div className={`w-12 h-2 rounded-full transition-colors duration-500 ${i <= step ? 'bg-emerald-500' : 'bg-emerald-500/20'}`} />
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
              <h2 className="text-3xl font-black mb-2 tracking-tight">Set up your Company</h2>
              <p className="text-muted-foreground">Let candidates know who they're applying to.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Company Name</label>
                <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Website</label>
                  <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-semibold">HQ Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="City, Country" />
                </div>
              </div>
              <ProfileUpload 
                label="Company Logo"
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
              <h2 className="text-3xl font-black mb-2 tracking-tight">About the Company</h2>
              <p className="text-muted-foreground">Tell us a bit about what you do and your scale.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label className="text-sm font-semibold mb-2 block">Industry</label>
                  <select value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none">
                    <option value="">Select Industry</option>
                    <option value="tech">Technology & Software</option>
                    <option value="finance">Finance & Fintech</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="other">Other</option>
                  </select>
                 </div>
                 <div>
                  <label className="text-sm font-semibold mb-2 block">Company Size</label>
                  <select value={formData.companySize} onChange={e => setFormData({...formData, companySize: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none">
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                 </div>
              </div>

              <div>
                <label className="text-sm font-semibold">Short Bio</label>
                <textarea 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-[120px] resize-none" 
                  placeholder="We are building the future of..."
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Hiring Preferences</h2>
              <p className="text-muted-foreground">What kind of talent are you looking for?</p>
            </div>

            <div className="space-y-6">
              <TagInput 
                label="Frequent Roles Hired" 
                placeholder="e.g. Frontend Engineer, Product Manager" 
                tags={formData.rolesHired} 
                setTags={(tags) => setFormData({...formData, rolesHired: tags})} 
              />
              
              <TagInput 
                label="Core Tech Stack (Optional)" 
                placeholder="e.g. React, Node.js, AWS" 
                tags={formData.techStack} 
                setTags={(tags) => setFormData({...formData, techStack: tags})} 
              />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 flex flex-col items-center justify-center text-center py-12">
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
               <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-emerald-500/40">
                 <Building2 className="w-12 h-12" />
               </div>
            </div>
            <div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter">Welcome aboard! 🎉</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your Company profile is ready. You can now start hiring pre-vetted, simulation-ready talent.
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
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         
         <div className="relative z-10">
           <div className="flex items-center space-x-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                <img src="/kaarya-logo-final.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tighter">Kaarya.OS</span>
           </div>

           <div className="space-y-8">
             <h3 className="text-2xl font-bold">Set up your company workspace to start hiring.</h3>
             <div className="space-y-6">
                {[
                  { title: "Company Details", desc: "Basic information" },
                  { title: "About", desc: "Industry & scale" },
                  { title: "Hiring Profile", desc: "Roles & tech stack" }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-500 ${step > idx + 1 ? 'bg-emerald-500 text-white' : step === idx + 1 ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-muted text-muted-foreground'}`}>
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
                 className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center shadow-lg shadow-emerald-500/20 ml-auto"
               >
                 Next Step <ArrowRight className="w-4 h-4 ml-2" />
               </button>
             ) : step === totalSteps - 1 ? (
               <button
                 onClick={handleComplete}
                 disabled={isSubmitting}
                 className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center shadow-lg shadow-emerald-500/20 ml-auto disabled:opacity-70 disabled:hover:scale-100"
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
                 className="w-full md:w-auto mx-auto px-12 py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/25"
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
