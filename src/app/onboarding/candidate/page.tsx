'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TagInput } from '@/components/ui/TagInput';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function CandidateOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    dob: '',
    location: '',
    profilePic: null as File | null,
    // Step 2
    currentStatus: '',
    college: '',
    degree: '',
    gradYear: '',
    currentCompany: '',
    jobTitle: '',
    experience: '',
    // Step 3
    resume: null as File | null,
    linkedin: '',
    portfolio: '',
    github: '',
    // Step 4
    desiredRoles: [],
    industry: '',
    employmentType: '',
    workMode: '',
    preferredLocations: '',
    expectedSalary: '',
    noticePeriod: '',
    // Step 5
    skills: [] as string[],
    languages: [] as string[],
    certifications: '',
    bio: ''
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#3b82f6', '#10b981']
    });
    toast.success("Profile created successfully!");
    setTimeout(() => {
      router.push('/');
    }, 2000);
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
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`w-10 h-2 rounded-full transition-colors duration-500 ${i <= step ? 'bg-primary' : 'bg-primary/20'}`} />
          </div>
        ))}
        <span className="text-xs font-bold text-muted-foreground ml-2 uppercase tracking-widest">
          Step {step} of 5
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
              <h2 className="text-3xl font-black mb-2 tracking-tight">Let’s get to know you</h2>
              <p className="text-muted-foreground">Tell us a bit about yourself so we can personalize your Kaarya.OS experience.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Full Name</label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Current Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="City, Country" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Profile Picture (optional)</label>
                <div className="mt-1 w-full border-2 border-dashed border-border hover:border-primary/50 bg-background/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                     <Upload className="w-5 h-5" />
                   </div>
                   <span className="text-sm font-medium">Click to upload or drag and drop</span>
                   <span className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Academic & Professional Background</h2>
              <p className="text-muted-foreground">Help recruiters understand where you’re coming from.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Are you currently:</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Student', 'Working Professional', 'Fresher', 'Career Switch'].map(status => (
                    <button key={status} onClick={() => setFormData({...formData, currentStatus: status})} className={`p-4 rounded-xl border text-left font-medium transition-all ${formData.currentStatus === status ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-background hover:border-primary/50'}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label className="text-sm font-semibold">College / University Name</label>
                  <input type="text" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                 </div>
                 <div>
                  <label className="text-sm font-semibold">Degree / Course</label>
                  <input type="text" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                 </div>
              </div>
              
              <div className="pt-4 border-t border-border mt-6">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Professional Experience (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                    <label className="text-sm font-semibold">Current Company</label>
                    <input type="text" value={formData.currentCompany} onChange={e => setFormData({...formData, currentCompany: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                   </div>
                   <div>
                    <label className="text-sm font-semibold">Job Title</label>
                    <input type="text" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Showcase your profile</h2>
              <p className="text-muted-foreground">Add your professional details to help us match you better.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold">Upload Resume (PDF/DOC)</label>
                <div className="mt-1 w-full border-2 border-dashed border-border hover:border-primary/50 bg-background/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                   <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Upload className="w-6 h-6" />
                   </div>
                   <span className="text-base font-bold">Upload Resume</span>
                   <span className="text-sm text-muted-foreground mt-1">Make sure it's up to date</span>
                </div>
              </div>

              <div className="space-y-4">
                 <div>
                  <label className="text-sm font-semibold">LinkedIn Profile URL</label>
                  <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://linkedin.com/in/..." />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                    <label className="text-sm font-semibold">Portfolio / Website</label>
                    <input type="url" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://..." />
                   </div>
                   <div>
                    <label className="text-sm font-semibold">GitHub / Behance / Dribbble</label>
                    <input type="url" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="https://..." />
                   </div>
                 </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">What are you looking for?</h2>
              <p className="text-muted-foreground">Tell us what kind of opportunities interest you.</p>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label className="text-sm font-semibold mb-2 block">Employment Type</label>
                  <select value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                    <option value="">Select Type</option>
                    <option value="fulltime">Full-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                 </div>
                 <div>
                  <label className="text-sm font-semibold mb-2 block">Work Mode</label>
                  <select value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                    <option value="">Select Mode</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                 </div>
               </div>

               <div>
                 <label className="text-sm font-semibold">Desired Job Role(s)</label>
                 <input type="text" placeholder="e.g. Frontend Engineer, Product Manager" className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label className="text-sm font-semibold">Expected Salary / Stipend (Optional)</label>
                  <input type="text" value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. $100k - $120k" />
                 </div>
                 <div>
                  <label className="text-sm font-semibold">Notice Period</label>
                  <select value={formData.noticePeriod} onChange={e => setFormData({...formData, noticePeriod: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                    <option value="">Select Notice Period</option>
                    <option value="immediate">Immediate</option>
                    <option value="15days">15 Days</option>
                    <option value="30days">30 Days</option>
                    <option value="60days+">60 Days+</option>
                  </select>
                 </div>
               </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">Skills & About You</h2>
              <p className="text-muted-foreground">Help us understand what makes you unique to find the right fit faster.</p>
            </div>

            <div className="space-y-6">
              <TagInput 
                label="Key Skills" 
                placeholder="Type a skill and press enter (e.g. React, Python)" 
                tags={formData.skills} 
                setTags={(tags) => setFormData({...formData, skills: tags})} 
              />
              
              <TagInput 
                label="Languages Known" 
                placeholder="e.g. English, Spanish" 
                tags={formData.languages} 
                setTags={(tags) => setFormData({...formData, languages: tags})} 
              />

              <div>
                <label className="text-sm font-semibold">Certifications (Optional)</label>
                <input type="text" value={formData.certifications} onChange={e => setFormData({...formData, certifications: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="e.g. AWS Certified Solutions Architect" />
              </div>

              <div>
                <label className="text-sm font-semibold">Short Bio</label>
                <textarea 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px] resize-none" 
                  placeholder="Final-year Computer Science student passionate about data analytics and problem solving, currently looking for opportunities in business intelligence and analytics."
                />
              </div>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step6" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 flex flex-col items-center justify-center text-center py-12">
            <div className="relative">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
               <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-primary/40">
                 <Sparkles className="w-12 h-12" />
               </div>
            </div>
            <div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter">You’re all set! 🎉</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your Kaarya.OS profile is ready. We’ll now start matching you with relevant roles, recruiters, and opportunities.
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Sidebar (Progress & Branding) */}
      <div className="w-full md:w-[400px] lg:w-[500px] bg-card border-r border-border p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         
         <div className="relative z-10">
           <div className="flex items-center space-x-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                <img src="/kaarya-logo-final.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tighter">Kaarya.OS</span>
           </div>

           <div className="space-y-8">
             <h3 className="text-2xl font-bold">Complete your profile to unlock premium opportunities.</h3>
             <div className="space-y-6">
                {[
                  { title: "Basic Details", desc: "Let's get to know you" },
                  { title: "Background", desc: "Academic & Professional" },
                  { title: "Showcase", desc: "Resume & Links" },
                  { title: "Preferences", desc: "Job expectations" },
                  { title: "Skills", desc: "What makes you unique" }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-500 ${step > idx + 1 ? 'bg-primary text-white' : step === idx + 1 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}>
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
         
         <div className="relative z-10 mt-12 text-sm text-muted-foreground">
           Need help? <a href="#" className="text-primary hover:underline font-medium">Contact Support</a>
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
                 className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center shadow-lg shadow-primary/20 ml-auto"
               >
                 Next Step <ArrowRight className="w-4 h-4 ml-2" />
               </button>
             ) : step === totalSteps - 1 ? (
               <button
                 onClick={handleComplete}
                 disabled={isSubmitting}
                 className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center shadow-lg shadow-primary/20 ml-auto disabled:opacity-70 disabled:hover:scale-100"
               >
                 {isSubmitting ? (
                   <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>Complete Profile <CheckCircle2 className="w-4 h-4 ml-2" /></>
                 )}
               </button>
             ) : (
               <button
                 onClick={() => router.push('/')}
                 className="w-full md:w-auto mx-auto px-12 py-4 bg-primary text-primary-foreground font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25"
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
