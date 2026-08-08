'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, MapPin, CheckCircle2, ArrowRight, Loader2, Image as ImageIcon, FileText, Upload, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Country, State } from 'country-state-city';
import Select from 'react-select';

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: 'var(--secondary)',
    borderColor: state.isFocused ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    borderRadius: '1rem',
    padding: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.05)' : 'none',
    '&:hover': {
      borderColor: 'rgba(59, 130, 246, 0.2)'
    }
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--card)',
    borderRadius: '1rem',
    overflow: 'hidden',
    zIndex: 50,
    border: '1px solid var(--border)'
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    color: state.isSelected ? '#ffffff' : 'var(--foreground)',
    cursor: 'pointer',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '700'
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'var(--foreground)',
    fontWeight: '700'
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'var(--foreground)',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'rgba(156, 163, 175, 0.3)',
    fontWeight: '700'
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function MultiStepOnboarding() {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(user?.primary_role || 'candidate');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Info
    age: '', gender: '', dob: '', phone: '',
    // Location
    country: '', state: '', city: '', address: '',
    // Professional (Candidate)
    occupation: '', currentCompany: '', experience: '', skills: '', certificates: '', ctc: '', relocation: '', jobType: '',
    linkedinUrl: '', githubUrl: '', noticePeriod: '', willingnessToTravel: '', careerGoals: '', keyAchievements: '', preferredWorkHours: '', hobbies: '',
    // Education (Candidate)
    schools: '', college: '', otherCollege: '',
    // Media
    profilePhoto: '', coverPhoto: '', coverLetter: '', resumeUrl: '',
    // Company Specific
    companyName: '', industry: '', companySize: '', companyDescription: '', hq: '', website: '', registrationNumber: '', foundingYear: '', targetAudience: '', coreValues: '',
    ceoName: '', techStack: '', workEnvironment: '', benefits: '', socialLinks: '',
    // College Specific
    universityName: '', otherUniversityName: '', universityType: '', accreditations: '', campusSize: '', coursesOffered: '', placementContact: '', totalCampuses: '', principalName: '', studentDemographics: '', topRecruiters: '',
    universityRanking: '', affiliatedUniversity: '', alumniCount: '',
    // Trainer Specific
    expertiseAreas: '', trainingExperience: '', pastClients: '', preferredAudience: '', hourlyRate: '', mentorshipAreas: '', teachingStyle: '', availability: '',
    languagesSpoken: '', trainingMethodology: '', successMetrics: ''
  });

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [universityOptions, setUniversityOptions] = useState<any[]>([]);
  const [universitySearch, setUniversitySearch] = useState('');

  useEffect(() => {
    if (user?.primary_role) setRole(user.primary_role);
    setCountries(Country.getAllCountries());
    
    fetch('/universities.json')
      .then(res => res.json())
      .then(data => {
        const uniqueNames = Array.from(new Set(data.map((u: any) => u.name))).sort() as string[];
        const options = uniqueNames.map(name => ({ value: name, label: name }));
        options.unshift({ value: 'Other', label: 'Other (Type Manually)' });
        setUniversityOptions(options);
      })
      .catch(err => console.error("Failed to load universities dataset", err));
  }, [user]);

  useEffect(() => {
    if (formData.country) {
      setStates(State.getStatesOfCountry(formData.country));
    } else {
      setStates([]);
    }
  }, [formData.country]);

  const filteredUniversityOptions = universitySearch 
    ? universityOptions.filter(o => o.label.toLowerCase().includes(universitySearch.toLowerCase())).slice(0, 50)
    : universityOptions.slice(0, 50);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleInputChange(field, res.data.url);
      toast.success('File uploaded successfully!');
    } catch (err) {
      toast.error('File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const candidateSteps = [
    { id: 'role_confirm', title: 'Role Selection', icon: <User className="h-5 w-5" /> },
    { id: 'basic_info', title: 'Basic Identity', icon: <User className="h-5 w-5" /> },
    { id: 'location', title: 'Location Details', icon: <MapPin className="h-5 w-5" /> },
    { id: 'professional', title: 'Professional Info', icon: <Briefcase className="h-5 w-5" /> },
    { id: 'assets', title: 'Assets & Media', icon: <FileText className="h-5 w-5" /> }
  ];

  const companySteps = [
    { id: 'role_confirm', title: 'Role Selection', icon: <User className="h-5 w-5" /> },
    { id: 'company_info', title: 'Company Identity', icon: <Briefcase className="h-5 w-5" /> },
    { id: 'location', title: 'Location Details', icon: <MapPin className="h-5 w-5" /> },
    { id: 'assets', title: 'Brand Assets', icon: <ImageIcon className="h-5 w-5" /> }
  ];

  const collegeSteps = [
    { id: 'role_confirm', title: 'Role Selection', icon: <User className="h-5 w-5" /> },
    { id: 'college_info', title: 'Institution Info', icon: <GraduationCap className="h-5 w-5" /> },
    { id: 'location', title: 'Location Details', icon: <MapPin className="h-5 w-5" /> },
    { id: 'assets', title: 'Brand Assets', icon: <ImageIcon className="h-5 w-5" /> }
  ];

  const trainerSteps = [
    { id: 'role_confirm', title: 'Role Selection', icon: <User className="h-5 w-5" /> },
    { id: 'trainer_info', title: 'Trainer Profile', icon: <GraduationCap className="h-5 w-5" /> },
    { id: 'location', title: 'Location Details', icon: <MapPin className="h-5 w-5" /> },
    { id: 'assets', title: 'Media & CV', icon: <FileText className="h-5 w-5" /> }
  ];

  const steps = role === 'company' ? companySteps : role === 'college' ? collegeSteps : role === 'trainer' ? trainerSteps : candidateSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const submitOnboarding = async () => {
    setIsLoading(true);
    try {
      const finalCollege = formData.college === 'Other' ? formData.otherCollege : formData.college;
      const finalUniversity = formData.universityName === 'Other' ? formData.otherUniversityName : formData.universityName;

      const payload = {
        primary_role: role === 'Professional / Candidate' ? 'candidate' : role,
        profile_picture: formData.profilePhoto,
        preferences: {
          age: formData.age, gender: formData.gender, dob: formData.dob, phone: formData.phone,
          country: formData.country, state: formData.state, city: formData.city, address: formData.address,
          companyName: formData.companyName || formData.currentCompany,
          currentCompany: formData.currentCompany,
          industry: formData.industry, companySize: formData.companySize, companyDescription: formData.companyDescription, website: formData.website, registrationNumber: formData.registrationNumber, foundingYear: formData.foundingYear, targetAudience: formData.targetAudience, coreValues: formData.coreValues,
          ceoName: formData.ceoName, techStack: formData.techStack, workEnvironment: formData.workEnvironment, benefits: formData.benefits, socialLinks: formData.socialLinks,
          universityName: finalUniversity || finalCollege, universityType: formData.universityType, accreditations: formData.accreditations, campusSize: formData.campusSize, coursesOffered: formData.coursesOffered, placementContact: formData.placementContact, totalCampuses: formData.totalCampuses, principalName: formData.principalName, studentDemographics: formData.studentDemographics, topRecruiters: formData.topRecruiters,
          universityRanking: formData.universityRanking, affiliatedUniversity: formData.affiliatedUniversity, alumniCount: formData.alumniCount,
          expertiseAreas: formData.expertiseAreas, trainingExperience: formData.trainingExperience, pastClients: formData.pastClients, preferredAudience: formData.preferredAudience, hourlyRate: formData.hourlyRate, mentorshipAreas: formData.mentorshipAreas, teachingStyle: formData.teachingStyle, availability: formData.availability,
          languagesSpoken: formData.languagesSpoken, trainingMethodology: formData.trainingMethodology, successMetrics: formData.successMetrics,
          ctc: formData.ctc, relocation: formData.relocation, jobType: formData.jobType, coverPic: formData.coverPhoto,
          linkedinUrl: formData.linkedinUrl, githubUrl: formData.githubUrl, noticePeriod: formData.noticePeriod, willingnessToTravel: formData.willingnessToTravel, preferredWorkHours: formData.preferredWorkHours, hobbies: formData.hobbies
        },
        resume_data: {
          occupation: formData.occupation, experience: formData.experience, skills: formData.skills, certificates: formData.certificates, schools: formData.schools, college: finalCollege,
          careerGoals: formData.careerGoals, keyAchievements: formData.keyAchievements, currentCompany: formData.currentCompany,
          coverLetter: formData.coverLetter, resumeUrl: formData.resumeUrl
        },
        skills: formData.skills || formData.expertiseAreas,
        bio: formData.companyDescription || formData.occupation || formData.expertiseAreas || finalUniversity

      };

      const res = await api.patch('/api/auth/me', payload);
      updateUser(res.data);
      toast.success('Onboarding Complete!');
      window.location.href = '/profile';
    } catch (err) {
      console.error(err);
      toast.error('Failed to save details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest text-center">Select Your Persona</motion.h3>
      <motion.div variants={itemAnim} className="grid grid-cols-2 gap-4">
        {['candidate', 'company', 'college', 'trainer'].map(r => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`p-6 border-2 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs flex flex-col items-center justify-center space-y-3 ${role === r ? 'border-primary bg-primary/10 text-primary scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-border hover:border-primary/50 text-muted-foreground'}`}
          >
            {r === 'college' ? <GraduationCap className="h-8 w-8" /> : r === 'company' ? <Briefcase className="h-8 w-8" /> : <User className="h-8 w-8" />}
            <span>{r}</span>
          </button>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderBasicInfo = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
      <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest border-b border-border pb-4">Basic Identity</motion.h3>
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}><SelectGroup label="Gender *" value={formData.gender} onChange={(v: string) => handleInputChange('gender', v)} options={[{value: 'Male', label: 'Male'}, {value: 'Female', label: 'Female'}, {value: 'Non-Binary', label: 'Non-Binary'}, {value: 'Other', label: 'Other'}]} /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Date of Birth *" type="date" value={formData.dob} onChange={(v: string) => handleInputChange('dob', v)} /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Age" type="number" value={formData.age} onChange={(v: string) => handleInputChange('age', v)} placeholder="e.g. 25" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Phone Number *" type="tel" value={formData.phone} onChange={(v: string) => handleInputChange('phone', v)} placeholder="+1 234 567 890" /></motion.div>
      </div>
    </motion.div>
  );

  const renderLocation = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
      <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest border-b border-border pb-4">Location Details</motion.h3>
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}>
          <SelectGroup 
            label="Country *" 
            value={formData.country} 
            onChange={(v: string) => { handleInputChange('country', v); handleInputChange('state', ''); }} 
            options={countries.map(c => ({ value: c.isoCode, label: c.name }))} 
          />
        </motion.div>
        <motion.div variants={itemAnim}>
          <SelectGroup 
            label="State / Province *" 
            value={formData.state} 
            onChange={(v: string) => handleInputChange('state', v)} 
            options={states.map(s => ({ value: s.isoCode, label: s.name }))} 
            disabled={!formData.country}
          />
        </motion.div>
        <motion.div variants={itemAnim}><InputGroup label="City *" value={formData.city} onChange={(v: string) => handleInputChange('city', v)} placeholder="City Name" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Full Address" value={formData.address} onChange={(v: string) => handleInputChange('address', v)} placeholder="123 Tech Lane..." /></motion.div>
      </div>
    </motion.div>
  );

  const renderProfessional = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
      <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest border-b border-border pb-4">Professional & Academic</motion.h3>
      <div className="grid grid-cols-2 gap-4">
         <motion.div variants={itemAnim}><InputGroup label="Current Occupation *" value={formData.occupation} onChange={(v: string) => handleInputChange('occupation', v)} placeholder="Software Engineer" /></motion.div>
         <motion.div variants={itemAnim}><InputGroup label="Current Company" value={formData.currentCompany} onChange={(v: string) => handleInputChange('currentCompany', v)} placeholder="Kaarya OS (Leave blank if none)" /></motion.div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}><SelectGroup label="Experience Level *" value={formData.experience} onChange={(v: string) => handleInputChange('experience', v)} options={[{value: 'Fresher (0-1 yrs)', label: 'Fresher (0-1 yrs)'}, {value: 'Junior (1-3 yrs)', label: 'Junior (1-3 yrs)'}, {value: 'Mid (3-5 yrs)', label: 'Mid (3-5 yrs)'}, {value: 'Senior (5+ yrs)', label: 'Senior (5+ yrs)'}]} /></motion.div>
        
        <motion.div variants={itemAnim} className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Primary College / Degree *</label>
          <Select
             options={filteredUniversityOptions}
             styles={customSelectStyles}
             placeholder="Search University..."
             onInputChange={(val) => setUniversitySearch(val)}
             filterOption={() => true} // disable default filtering
             onChange={(opt: any) => handleInputChange('college', opt?.value || '')}
             value={universityOptions.find(o => o.value === formData.college) || null}
          />
        </motion.div>
      </div>
      
      {formData.college === 'Other' && (
        <motion.div variants={itemAnim}><InputGroup label="Enter College / University Name Manually *" value={formData.otherCollege} onChange={(v: string) => handleInputChange('otherCollege', v)} placeholder="Type your university name..." /></motion.div>
      )}

      <motion.div variants={itemAnim}><InputGroup label="Core Skills (Comma Separated) *" value={formData.skills} onChange={(v: string) => handleInputChange('skills', v)} placeholder="React, Node.js, Python" /></motion.div>
      <motion.div variants={itemAnim}><InputGroup label="Certifications" value={formData.certificates} onChange={(v: string) => handleInputChange('certificates', v)} placeholder="AWS Certified, GCP, etc." /></motion.div>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}><InputGroup label="LinkedIn Profile URL" type="url" value={formData.linkedinUrl} onChange={(v: string) => handleInputChange('linkedinUrl', v)} placeholder="https://linkedin.com/in/..." /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="GitHub / Portfolio URL" type="url" value={formData.githubUrl} onChange={(v: string) => handleInputChange('githubUrl', v)} placeholder="https://github.com/..." /></motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}><InputGroup label="Target Salary / CTC" value={formData.ctc} onChange={(v: string) => handleInputChange('ctc', v)} placeholder="$100k - $120k" /></motion.div>
        <motion.div variants={itemAnim}><SelectGroup label="Willingness to Relocate" value={formData.relocation} onChange={(v: string) => handleInputChange('relocation', v)} options={[{value: 'Yes', label: 'Yes'}, {value: 'No', label: 'No'}]} /></motion.div>
        <motion.div variants={itemAnim}><SelectGroup label="Preferred Job Type" value={formData.jobType} onChange={(v: string) => handleInputChange('jobType', v)} options={[{value: 'Remote', label: 'Remote'}, {value: 'On-site', label: 'On-site'}, {value: 'Hybrid', label: 'Hybrid'}]} /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Notice Period" value={formData.noticePeriod} onChange={(v: string) => handleInputChange('noticePeriod', v)} placeholder="e.g. 30 days" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Willingness to Travel (%)" type="number" value={formData.willingnessToTravel} onChange={(v: string) => handleInputChange('willingnessToTravel', v)} placeholder="e.g. 20" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Preferred Work Hours" value={formData.preferredWorkHours} onChange={(v: string) => handleInputChange('preferredWorkHours', v)} placeholder="9 AM - 5 PM EST" /></motion.div>
      </div>

      <div className="space-y-4">
         <motion.div variants={itemAnim} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Career Goals</label>
            <textarea rows={2} className="w-full bg-secondary border border-transparent focus:border-primary/30 hover:border-primary/20 rounded-2xl px-4 py-4 text-sm outline-none transition-all font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 shadow-inner" placeholder="Where do you see yourself in 3-5 years?" value={formData.careerGoals} onChange={(e) => handleInputChange('careerGoals', e.target.value)} />
         </motion.div>
         <motion.div variants={itemAnim} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Key Achievements</label>
            <textarea rows={2} className="w-full bg-secondary border border-transparent focus:border-primary/30 hover:border-primary/20 rounded-2xl px-4 py-4 text-sm outline-none transition-all font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 shadow-inner" placeholder="List your biggest career wins..." value={formData.keyAchievements} onChange={(e) => handleInputChange('keyAchievements', e.target.value)} />
         </motion.div>
         <motion.div variants={itemAnim}><InputGroup label="Hobbies & Interests" value={formData.hobbies} onChange={(v: string) => handleInputChange('hobbies', v)} placeholder="Reading, Hiking, Open Source..." /></motion.div>
      </div>
    </motion.div>
  );

  const renderCompanyInfo = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
      <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest border-b border-border pb-4">Company Details</motion.h3>
      <motion.div variants={itemAnim}><InputGroup label="Company Name *" value={formData.companyName} onChange={(v: string) => handleInputChange('companyName', v)} placeholder="Acme Corp" /></motion.div>
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}><SelectGroup label="Industry *" value={formData.industry} onChange={(v: string) => handleInputChange('industry', v)} options={[{value: 'Technology', label: 'Technology'}, {value: 'Finance', label: 'Finance'}, {value: 'Healthcare', label: 'Healthcare'}, {value: 'Retail', label: 'Retail'}, {value: 'Other', label: 'Other'}]} /></motion.div>
        <motion.div variants={itemAnim}><SelectGroup label="Company Size *" value={formData.companySize} onChange={(v: string) => handleInputChange('companySize', v)} options={[{value: '1-10', label: '1-10'}, {value: '11-50', label: '11-50'}, {value: '51-200', label: '51-200'}, {value: '201-1000', label: '201-1000'}, {value: '1000+', label: '1000+'}]} /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Website URL" value={formData.website} onChange={(v: string) => handleInputChange('website', v)} placeholder="https://..." /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Registration / Tax Number" value={formData.registrationNumber} onChange={(v: string) => handleInputChange('registrationNumber', v)} placeholder="EIN or equivalent" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Founding Year" value={formData.foundingYear} type="number" onChange={(v: string) => handleInputChange('foundingYear', v)} placeholder="2010" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="CEO / Founder Name" value={formData.ceoName} onChange={(v: string) => handleInputChange('ceoName', v)} placeholder="John Doe" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Target Audience" value={formData.targetAudience} onChange={(v: string) => handleInputChange('targetAudience', v)} placeholder="B2B, B2C, Enterprise" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Core Values" value={formData.coreValues} onChange={(v: string) => handleInputChange('coreValues', v)} placeholder="Innovation, Integrity..." /></motion.div>
        <motion.div variants={itemAnim}><SelectGroup label="Work Environment" value={formData.workEnvironment} onChange={(v: string) => handleInputChange('workEnvironment', v)} options={[{value: 'Remote', label: 'Fully Remote'}, {value: 'Hybrid', label: 'Hybrid'}, {value: 'Office', label: 'In-Office'}]} /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Social Media Links" value={formData.socialLinks} onChange={(v: string) => handleInputChange('socialLinks', v)} placeholder="LinkedIn, Twitter..." /></motion.div>
      </div>
      <div className="space-y-4 mt-2">
         <motion.div variants={itemAnim}><InputGroup label="Tech Stack / Tools Used" value={formData.techStack} onChange={(v: string) => handleInputChange('techStack', v)} placeholder="React, Node, AWS..." /></motion.div>
         <motion.div variants={itemAnim}><InputGroup label="Key Benefits & Perks" value={formData.benefits} onChange={(v: string) => handleInputChange('benefits', v)} placeholder="Health Insurance, 401k..." /></motion.div>
      </div>
      <motion.div variants={itemAnim} className="space-y-2 mt-4">
         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Description *</label>
         <textarea rows={4} className="w-full bg-secondary border border-transparent focus:border-primary/30 hover:border-primary/20 rounded-2xl px-4 py-4 text-sm outline-none transition-all font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 shadow-inner" placeholder="Describe your company culture and mission..." value={formData.companyDescription} onChange={(e) => handleInputChange('companyDescription', e.target.value)} />
      </motion.div>
    </motion.div>
  );

  const renderCollegeInfo = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
      <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest border-b border-border pb-4">Institution Details</motion.h3>
      
      <motion.div variants={itemAnim} className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">University / College Name *</label>
        <Select
           options={filteredUniversityOptions}
           styles={customSelectStyles}
           placeholder="Search University..."
           onInputChange={(val) => setUniversitySearch(val)}
           filterOption={() => true} // disable default filtering
           onChange={(opt: any) => handleInputChange('universityName', opt?.value || '')}
           value={universityOptions.find(o => o.value === formData.universityName) || null}
        />
      </motion.div>

      {formData.universityName === 'Other' && (
        <motion.div variants={itemAnim}><InputGroup label="Enter College / University Name Manually *" value={formData.otherUniversityName} onChange={(v: string) => handleInputChange('otherUniversityName', v)} placeholder="Type your institution name..." /></motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}><SelectGroup label="Institution Type *" value={formData.universityType} onChange={(v: string) => handleInputChange('universityType', v)} options={[{value: 'Public', label: 'Public'}, {value: 'Private', label: 'Private'}, {value: 'Community', label: 'Community'}, {value: 'Other', label: 'Other'}]} /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Campus Size / Total Students" value={formData.campusSize} onChange={(v: string) => handleInputChange('campusSize', v)} placeholder="10,000+" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Accreditations" value={formData.accreditations} onChange={(v: string) => handleInputChange('accreditations', v)} placeholder="NAAC, ABET..." /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Placement Cell Contact" value={formData.placementContact} onChange={(v: string) => handleInputChange('placementContact', v)} placeholder="placement@university.edu" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Total Campuses" value={formData.totalCampuses} onChange={(v: string) => handleInputChange('totalCampuses', v)} type="number" placeholder="1" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Principal / Director Name" value={formData.principalName} onChange={(v: string) => handleInputChange('principalName', v)} placeholder="Dr. John Doe" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Student Demographics" value={formData.studentDemographics} onChange={(v: string) => handleInputChange('studentDemographics', v)} placeholder="e.g. 60% Male, 40% Female" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Top Recruiters" value={formData.topRecruiters} onChange={(v: string) => handleInputChange('topRecruiters', v)} placeholder="Google, Amazon, TCS..." /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="University Ranking" value={formData.universityRanking} onChange={(v: string) => handleInputChange('universityRanking', v)} placeholder="e.g. Top 100 Global" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Affiliated University" value={formData.affiliatedUniversity} onChange={(v: string) => handleInputChange('affiliatedUniversity', v)} placeholder="If applicable..." /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Total Alumni Count" type="number" value={formData.alumniCount} onChange={(v: string) => handleInputChange('alumniCount', v)} placeholder="50,000" /></motion.div>
      </div>
      <motion.div variants={itemAnim} className="space-y-2 mt-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Courses Offered *</label>
         <textarea rows={3} className="w-full bg-secondary border border-transparent focus:border-primary/30 hover:border-primary/20 rounded-2xl px-4 py-4 text-sm outline-none transition-all font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 shadow-inner" placeholder="B.Tech, MBA, Ph.D..." value={formData.coursesOffered} onChange={(e) => handleInputChange('coursesOffered', e.target.value)} />
      </motion.div>
    </motion.div>
  );

  const renderTrainerInfo = () => (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
      <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest border-b border-border pb-4">Trainer Profile</motion.h3>
      <motion.div variants={itemAnim}><InputGroup label="Expertise Areas (Comma Separated) *" value={formData.expertiseAreas} onChange={(v: string) => handleInputChange('expertiseAreas', v)} placeholder="Leadership, Technical Skills..." /></motion.div>
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemAnim}><InputGroup label="Years of Experience *" type="number" value={formData.trainingExperience} onChange={(v: string) => handleInputChange('trainingExperience', v)} placeholder="e.g. 5" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Hourly Rate (USD)" type="number" value={formData.hourlyRate} onChange={(v: string) => handleInputChange('hourlyRate', v)} placeholder="100" /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Preferred Audience" value={formData.preferredAudience} onChange={(v: string) => handleInputChange('preferredAudience', v)} placeholder="Corporate, Freshers..." /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Past Clients" value={formData.pastClients} onChange={(v: string) => handleInputChange('pastClients', v)} placeholder="Google, Amazon..." /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Teaching Style" value={formData.teachingStyle} onChange={(v: string) => handleInputChange('teachingStyle', v)} placeholder="Interactive, Hands-on..." /></motion.div>
        <motion.div variants={itemAnim}><SelectGroup label="Availability" value={formData.availability} onChange={(v: string) => handleInputChange('availability', v)} options={[{value: 'Weekdays', label: 'Weekdays'}, {value: 'Weekends', label: 'Weekends'}, {value: 'Both', label: 'Both'}]} /></motion.div>
        <motion.div variants={itemAnim}><InputGroup label="Languages Spoken" value={formData.languagesSpoken} onChange={(v: string) => handleInputChange('languagesSpoken', v)} placeholder="English, Spanish..." /></motion.div>
      </div>
      <div className="space-y-4 mt-2">
         <motion.div variants={itemAnim}><InputGroup label="Mentorship Areas" value={formData.mentorshipAreas} onChange={(v: string) => handleInputChange('mentorshipAreas', v)} placeholder="Career Transition, System Design..." /></motion.div>
         <motion.div variants={itemAnim}><InputGroup label="Certifications" value={formData.certificates} onChange={(v: string) => handleInputChange('certificates', v)} placeholder="ICF, MCT..." /></motion.div>
         <motion.div variants={itemAnim}><InputGroup label="Training Methodology" value={formData.trainingMethodology} onChange={(v: string) => handleInputChange('trainingMethodology', v)} placeholder="Project-based, theory-first..." /></motion.div>
         <motion.div variants={itemAnim}><InputGroup label="Success Metrics / Feedback Score" value={formData.successMetrics} onChange={(v: string) => handleInputChange('successMetrics', v)} placeholder="e.g. 4.8/5 average rating" /></motion.div>
      </div>
    </motion.div>
  );

  const renderAssets = () => {
    const isCompanyOrCollege = role === 'company' || role === 'college';
    const documentLabel = isCompanyOrCollege ? 'Upload Registration / Identity Document (PDF) *' : 'Upload Resume / CV (PDF) *';
    const documentNotes = isCompanyOrCollege ? 'Required for verifying your authenticity (e.g. Business License, Accreditation Certificate).' : 'Required for candidates/trainers to showcase their profile.';

    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
        <motion.h3 variants={itemAnim} className="text-xl font-black mb-4 uppercase tracking-widest border-b border-border pb-4">Assets & Media</motion.h3>
        <div className="grid grid-cols-1 gap-4">
          <motion.div variants={itemAnim} className="relative">
            <input type="file" onChange={(e) => handleFileUpload(e, 'resumeUrl')} accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="p-6 border-2 border-dashed border-primary/40 rounded-3xl bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center group shadow-inner">
               {isUploading ? <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" /> : <Upload className="h-8 w-8 text-primary mb-2 group-hover:scale-125 group-hover:text-blue-400 transition-all" />}
               <p className="text-sm font-bold text-primary">{formData.resumeUrl ? 'File Uploaded (Click to Change)' : documentLabel}</p>
               <p className="text-xs text-muted-foreground mt-1 text-center truncate w-full max-w-xs">{formData.resumeUrl || documentNotes}</p>
            </div>
          </motion.div>
          <motion.div variants={itemAnim} className="relative">
            <input type="file" onChange={(e) => handleFileUpload(e, 'profilePhoto')} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="p-4 border border-border rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-bold">{formData.profilePhoto ? 'Profile Photo Uploaded' : 'Upload Profile/Logo Photo'}</span>
               </div>
               {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </motion.div>
          <motion.div variants={itemAnim} className="relative">
            <input type="file" onChange={(e) => handleFileUpload(e, 'coverPhoto')} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="p-4 border border-border rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-bold">{formData.coverPhoto ? 'Cover Photo Uploaded' : 'Upload Cover Photo (Optional)'}</span>
               </div>
               {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </motion.div>
          {(role === 'candidate' || role === 'trainer') && (
            <motion.div variants={itemAnim}>
              <InputGroup label="Cover Letter Notes" value={formData.coverLetter} onChange={(v: string) => handleInputChange('coverLetter', v)} placeholder="Briefly describe why you are joining Kaarya..." />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderStepContent = () => {
    const stepId = steps[currentStep].id;
    switch (stepId) {
      case 'role_confirm': return renderRoleSelection();
      case 'basic_info': return renderBasicInfo();
      case 'location': return renderLocation();
      case 'professional': return renderProfessional();
      case 'company_info': return renderCompanyInfo();
      case 'college_info': return renderCollegeInfo();
      case 'trainer_info': return renderTrainerInfo();
      case 'assets': return renderAssets();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="w-full max-w-3xl bg-card rounded-[3rem] border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 flex flex-col min-h-[600px] backdrop-blur-xl">
        {/* Progress Header */}
        <div className="flex bg-secondary p-4 justify-between items-center px-8 border-b border-border">
          {steps.map((s, idx) => (
            <div key={s.id} className={`flex flex-col items-center space-y-2 ${idx <= currentStep ? 'text-primary' : 'text-muted-foreground opacity-50'}`}>
               <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${idx < currentStep ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]' : idx === currentStep ? 'border-primary scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-border'}`}>
                 {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
               </div>
               <span className="text-[9px] uppercase font-black tracking-widest hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12 flex-1 overflow-y-auto hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-secondary/50 border-t border-border flex justify-between items-center px-8">
          <button 
             onClick={handlePrev} 
             disabled={currentStep === 0 || isLoading}
             className="px-6 py-3 font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0 text-sm uppercase tracking-widest"
          >
            Back
          </button>
          
          <button 
             onClick={handleNext}
             disabled={isLoading || isUploading}
             className="px-8 py-3 bg-primary text-white rounded-xl font-black flex items-center space-x-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm"
          >
             {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
               <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}</span>
               <ArrowRight className="h-4 w-4" />
             </>}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <input
        type={type}
        className="w-full bg-secondary border border-transparent focus:border-primary/30 hover:border-primary/20 rounded-2xl px-4 py-4 text-sm outline-none transition-all font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 shadow-inner"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectGroup({ label, value, onChange, options, disabled = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <select
        disabled={disabled}
        className={`w-full bg-secondary border border-transparent focus:border-primary/30 hover:border-primary/20 rounded-2xl px-4 py-4 text-sm outline-none transition-all font-bold focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer shadow-inner ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>Select...</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
