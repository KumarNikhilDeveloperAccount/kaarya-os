'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  Linkedin, Github, Globe, 
  Briefcase, GraduationCap, Code2, 
  Award, CheckCircle2, Star, Zap,
  Camera, Edit3, Share2, Building2
} from 'lucide-react';
import { getProfileData, getActiveRole, fileToBase64, saveProfileData } from '@/lib/store';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [role, setRole] = useState('candidate');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const activeRole = getActiveRole();
    setRole(activeRole);
    const data = getProfileData(activeRole) || {};
    
    if (user) {
      const dbProfile = {
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.preferences?.phone || '',
        location: user.preferences?.city ? `${user.preferences.city}, ${user.preferences.country}` : '',
        bio: user.bio || '',
        jobTitle: user.resume_data?.occupation || user.preferences?.industry || user.preferences?.expertiseAreas || 'Unknown Role',
        currentCompany: user.preferences?.companyName || user.preferences?.currentCompany || user.resume_data?.currentCompany || '',
        coverPic: user.preferences?.coverPic || '',
        profilePic: user.profile_picture || '',
        resumeUrl: user.resume_data?.resumeUrl || user.resume_data?.resume_url || '',
        skills: user.skills ? user.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        companyName: user.preferences?.companyName || '',
        collegeName: user.preferences?.universityName || user.resume_data?.college || '',
        industry: user.preferences?.industry || '',
        companySize: user.preferences?.companySize || '',
        yearsExperience: user.preferences?.trainingExperience || user.resume_data?.experience || '',
        linkedin: user.preferences?.linkedinUrl || '',
        github: user.preferences?.githubUrl || '',
        website: user.preferences?.website || '',
        degrees: user.resume_data?.schools || user.preferences?.coursesOffered || '',
      };
      setProfile({ ...data, ...dbProfile });
    } else if (Object.keys(data).length > 0) {
      setProfile(data);
    } else {
      setProfile({});
    }
  }, [user]);

  const handleCoverUpload = async (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await api.post('/api/upload', formData);
        const photoUrl = uploadRes.data.url;
        
        const response = await api.patch('/api/auth/me', { preferences: { coverPic: photoUrl } });
        if (updateUser) updateUser(response.data);
        
        const updatedProfile = { ...profile, coverPic: photoUrl };
        setProfile(updatedProfile);
        if (role) saveProfileData(role, updatedProfile);
        toast.success("Cover photo updated!");
      } catch (err) {
        toast.error("Failed to upload cover photo.");
      }
    }
  };

  const handleProfileUpload = async (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await api.post('/api/upload', formData);
        const photoUrl = uploadRes.data.url;
        
        const response = await api.patch('/api/auth/me', { profile_picture: photoUrl });
        if (updateUser) updateUser(response.data);
        
        const updatedProfile = { ...profile, profilePic: photoUrl };
        setProfile(updatedProfile);
        if (role) saveProfileData(role, updatedProfile);
        toast.success("Profile photo updated!");
      } catch (err: any) {
        console.error("Profile upload error:", err);
        toast.error("Failed to upload profile photo: " + (err.response?.data?.detail || err.message || "Unknown error"));
      }
    }
  };

  if (!profile) return (
     <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
     </div>
  );

  // Derive display values based on role
  let displayName = profile.fullName || profile.companyName || profile.collegeName || 'Anonymous User';
  let displayTitle = profile.jobTitle || profile.industry || profile.affiliation || 'Unspecified Role';
  let displayBio = profile.bio || 'This user has not provided a bio yet.';
  let displayPic = profile.profilePic || profile.logo;
  let displayLocation = profile.location || 'Location Not Specified';
  let displayTags = profile.skills || profile.techStack || profile.expertise || profile.degrees || [];
  
  if (role === 'company' && profile.companySize) {
    displayTitle = `${profile.industry} • ${profile.companySize} employees`;
  } else if (role === 'college' && profile.placementOfficer) {
    displayTitle = `${profile.affiliation || 'University'} • Placements: ${profile.placementOfficer}`;
  } else if (role === 'trainer' && profile.yearsExperience) {
    displayTitle = `${profile.jobTitle} • ${profile.yearsExperience} yrs exp`;
  }

  // Get initials for fallback image
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show" className="max-w-7xl mx-auto py-10 px-6 space-y-12">
      {/* Profile Header */}
      <motion.div variants={itemAnim} className="relative">
         <div 
           className="h-64 w-full bg-gradient-to-r from-blue-600/80 via-indigo-600/80 to-primary/80 rounded-[3rem] shadow-[0_0_40px_rgba(59,130,246,0.3)] relative overflow-hidden group bg-cover bg-center transition-all duration-700"
           style={profile.coverPic ? { backgroundImage: `url(${profile.coverPic})` } : {}}
         >
            {!profile.coverPic && <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            
            <input 
              id="cover-upload" 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleCoverUpload}
            />
            <button 
              onClick={() => document.getElementById('cover-upload')?.click()}
              className="absolute bottom-6 right-8 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 hover:scale-105 transition-all flex items-center space-x-2 z-50 cursor-pointer shadow-lg"
            >
               <Camera className="h-4 w-4" />
               <span>Update Cover</span>
            </button>
         </div>

         <div className="px-12 -mt-24 relative z-10 flex flex-col md:flex-row items-end gap-10">
            <div className="relative group">
               <div className="w-48 h-48 rounded-[3rem] bg-card border-[6px] border-background shadow-2xl overflow-hidden flex items-center justify-center relative">
                  {displayPic ? (
                    <img src={displayPic} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-6xl font-black transition-transform duration-700 group-hover:scale-110">
                       {getInitials(displayName)}
                    </div>
                  )}
               </div>
               <input 
                 id="profile-upload" 
                 type="file" 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleProfileUpload}
               />
               <button 
                 onClick={() => document.getElementById('profile-upload')?.click()}
                 className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 hover:shadow-primary/50 active:scale-95 transition-all"
               >
                  <Edit3 className="h-5 w-5" />
               </button>
            </div>
            
            <div className="flex-1 pb-4 w-full">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                     <h1 className="text-5xl font-black tracking-tight flex items-center gap-4 uppercase">
                        {displayName}
                        {displayName !== 'Anonymous User' && <CheckCircle2 className="h-8 w-8 text-blue-500 shadow-blue-500/50 drop-shadow-lg" />}
                     </h1>
                     <p className="text-xl font-bold text-muted-foreground mt-2 uppercase tracking-widest flex items-center opacity-80">
                        {displayTitle} {profile.currentCompany ? `• ${profile.currentCompany}` : ''}
                     </p>
                  </div>
                  <div className="flex gap-4 self-start md:self-auto">
                     <button onClick={() => toast.success('Profile broadcasted to network!')} className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
                        <Share2 className="h-4 w-4" />
                        <span>Broadcast Profile</span>
                     </button>
                     {profile.resumeUrl && (
                       <button 
                         onClick={() => window.open(profile.resumeUrl, '_blank')}
                         className="px-8 py-4 bg-secondary text-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border border-border"
                       >
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span>View & Download Resume</span>
                       </button>
                     )}
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-6 mt-8">
                  {profile.email && <ContactItem icon={Mail} value={profile.email} />}
                  {profile.phone && <ContactItem icon={Phone} value={profile.phone} />}
                  <ContactItem icon={MapPin} value={displayLocation} />
                  {profile.linkedin && <ContactItem icon={Linkedin} value={profile.linkedin} />}
                  {profile.github && <ContactItem icon={Github} value={profile.github} />}
                  {profile.website && <ContactItem icon={Globe} value={profile.website} />}
               </div>
            </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Left Column: Stats & Skills */}
         <div className="space-y-12">
            {/* Performance Matrix */}
            <motion.div variants={itemAnim} className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 space-y-8 hover:shadow-2xl transition-all">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  {role === 'company' ? 'Company Metrics' : 'Elite Performance Matrix'}
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  {role === 'company' ? (
                    <>
                      <StatCard label="Hired" value="N/A" color="text-primary" />
                      <StatCard label="Response Rate" value="100%" color="text-emerald-500" />
                      <StatCard label="Rating" value="New" color="text-amber-500" />
                    </>
                  ) : (
                    <>
                      <StatCard label="Hireability" value="High" color="text-primary" />
                      <StatCard label="Technical" value="Verified" color="text-emerald-500" />
                      <StatCard label="Comms" value="Excellent" color="text-blue-500" />
                      <StatCard label="Labs" value="Active" color="text-amber-500" />
                    </>
                  )}
               </div>
            </motion.div>

            {/* Specialties */}
            {displayTags && displayTags.length > 0 && (
              <motion.div variants={itemAnim} className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 space-y-6 hover:shadow-2xl transition-all">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center">
                    <Code2 className="h-4 w-4 mr-2" />
                    Core Specialties / Tags
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {displayTags.map((s: string) => (
                      <span key={s} className="px-4 py-2 bg-secondary/60 border border-border rounded-xl text-xs font-bold tracking-tight hover:bg-primary/10 hover:border-primary/30 transition-all cursor-default">
                         {s}
                      </span>
                    ))}
                 </div>
              </motion.div>
            )}
         </div>

         {/* Center/Right: Experience & Legacy */}
         <div className="lg:col-span-2 space-y-12">
            {/* Mission Statement */}
            <motion.div variants={itemAnim} className="p-10 bg-secondary/30 rounded-[3rem] border border-border relative overflow-hidden shadow-inner group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 group-hover:rotate-12">
                  <Star className="h-32 w-32" />
               </div>
               <h3 className="text-xl font-black tracking-tight mb-4 uppercase">
                 {role === 'company' ? 'Company Vision' : 'Mission Statement'}
               </h3>
               <p className="text-lg font-medium leading-relaxed italic text-muted-foreground/80">
                 "{displayBio}"
               </p>
            </motion.div>

            {/* Career Reels / Media (Living Identity) */}
            {role === 'candidate' && profile.reels && profile.reels.length > 0 && (
               <motion.div variants={itemAnim} className="space-y-6">
                  <div className="flex items-center justify-between px-4">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Professional Reels</h3>
                     <button onClick={() => toast.info('Media uploader coming soon!')} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center">
                       <Camera className="h-3 w-3 mr-1" /> Add Media
                     </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
                     {profile.reels.map((reel: any, i: number) => (
                        <div key={i} className="w-48 h-72 rounded-3xl bg-zinc-900 border border-border shrink-0 snap-start relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all">
                           <video src={reel.url} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                           <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-xs font-bold leading-tight">{reel.caption || 'System Design Architecture overview'}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}

            {/* Endorsements & Skill Graph */}
            {role === 'candidate' && (
               <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Verified Endorsements</h3>
                     <div className="space-y-4">
                        {displayTags && displayTags.length > 0 ? displayTags.slice(0, 3).map((tag: string, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-2xl border border-border hover:border-primary/30 transition-all">
                              <span className="text-xs font-bold">{tag}</span>
                              <div className="flex items-center">
                                 <div className="flex -space-x-2 mr-3">
                                    {[1, 2, 3].map(j => (
                                       <div key={j} className="w-6 h-6 rounded-full border-2 border-card bg-primary text-[8px] flex items-center justify-center text-white font-bold z-10">
                                          U{j}
                                       </div>
                                    ))}
                                 </div>
                                 <span className="text-[10px] font-black text-primary">+12</span>
                              </div>
                           </div>
                        )) : (
                           <p className="text-xs text-muted-foreground italic">Add skills to receive endorsements.</p>
                        )}
                     </div>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-indigo-600/10 border border-primary/20 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-center items-center text-center hover:scale-[1.02] transition-transform">
                     <div className="w-24 h-24 rounded-full border-4 border-dashed border-primary/50 flex items-center justify-center mb-4 relative animate-[spin_10s_linear_infinite]">
                        <div className="absolute inset-0 border-4 border-primary rounded-full animate-pulse" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)' }} />
                        <CheckCircle2 className="h-8 w-8 text-primary animate-[spin_10s_linear_infinite_reverse]" />
                     </div>
                     <h4 className="font-black text-lg">Skill Graph Synchronized</h4>
                     <p className="text-xs font-medium text-muted-foreground mt-2">Rit.ai has verified your technical depth against peer profiles in your tier.</p>
                  </div>
               </motion.div>
            )}

             {/* Workforce Legacy / Details based on role */}
            {role === 'candidate' || role === 'trainer' ? (
              <motion.div variants={itemAnim} className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Workforce Legacy</h3>
                    <button onClick={() => toast.info('Record update feature coming soon!')} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Update Records</button>
                 </div>
                 <div className="space-y-6">
                    <LegacyItem 
                      role={profile.jobTitle || 'Unspecified Role'} 
                      company={profile.currentCompany || 'Independent'} 
                      period={profile.yearsExperience ? `${profile.yearsExperience} experience` : 'Present'} 
                      desc={profile.bio || "No description provided."} 
                    />
                 </div>
              </motion.div>
            ) : role === 'company' ? (
              <motion.div variants={itemAnim} className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Active Roles</h3>
                 </div>
                 <div className="space-y-6">
                    {profile.rolesHired && profile.rolesHired.length > 0 ? profile.rolesHired.map((roleTitle: string, idx: number) => (
                      <LegacyItem 
                        key={idx}
                        role={roleTitle} 
                        company={profile.companyName} 
                        period="Actively Hiring" 
                        desc="Looking for top talent in this domain. Connect with us to learn more." 
                      />
                    )) : (
                      <LegacyItem 
                        role="No Active Roles" 
                        company={profile.companyName} 
                        period="Not Hiring" 
                        desc="This company has not posted any active roles yet." 
                      />
                    )}
                 </div>
              </motion.div>
            ) : null}

            {/* Foundation */}
            {(role === 'candidate' || role === 'college') && (
              <motion.div variants={itemAnim} className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      {role === 'college' ? 'Institution Highlights' : 'Educational Foundation'}
                    </h3>
                 </div>
                 <div className="bg-card border border-border rounded-[2rem] p-8 flex items-center space-x-6 hover:bg-secondary/40 transition-all cursor-default shadow-lg hover:shadow-xl group">
                    <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                       <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tight">
                         {role === 'college' ? (profile.streams?.[0] || 'Unspecified Streams') : (profile.degrees || 'Unspecified Degree')}
                       </h4>
                       <p className="text-sm font-bold opacity-70">
                         {role === 'college' ? profile.collegeName : (profile.collegeName || 'Unspecified Institution')}
                       </p>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                         {profile.gradYear ? `Class of ${profile.gradYear}` : 'Alumni'}
                       </p>
                    </div>
                 </div>
              </motion.div>
            )}
         </div>
      </div>
    </motion.div>
  );
}

function ContactItem({ icon: Icon, value }: any) {
  return (
    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
       <Icon className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
       <span>{value}</span>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="p-4 bg-secondary/30 border border-border rounded-2xl flex flex-col items-center justify-center text-center group hover:scale-105 hover:bg-secondary/50 transition-all shadow-sm">
       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 group-hover:text-primary transition-colors">{label}</span>
       <span className={`text-xl font-black tracking-tighter ${color} group-hover:scale-110 transition-transform`}>{value}</span>
    </div>
  );
}

function LegacyItem({ role, company, period, desc }: any) {
  return (
    <div className="p-8 bg-card border border-border rounded-[2.5rem] relative group hover:border-primary/30 transition-all shadow-sm hover:shadow-xl">
       <div className="flex justify-between items-start mb-4">
          <div className="p-4 bg-primary/5 rounded-[1.5rem] text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all">
             <Briefcase className="h-6 w-6" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-secondary text-muted-foreground rounded-full border border-border shadow-inner">
             {period}
          </div>
       </div>
       <h4 className="text-2xl font-black tracking-tight uppercase mb-1">{role}</h4>
       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 opacity-80">{company}</p>
       <p className="text-sm font-medium leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
