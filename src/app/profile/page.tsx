'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  Linkedin, Github, Globe, 
  Briefcase, GraduationCap, Code2, 
  Award, CheckCircle2, Star, Zap,
  Camera, Edit3, Share2, Building2
} from 'lucide-react';
import { getProfileData, getActiveRole } from '@/lib/store';

export default function ProfilePage() {
  const [role, setRole] = useState('candidate');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const activeRole = getActiveRole();
    setRole(activeRole);
    const data = getProfileData(activeRole);
    
    // Set default fallback data if nothing is in local storage
    if (data) {
      setProfile(data);
    } else {
      setProfile({
        fullName: 'Kumar Nikhil',
        location: 'San Francisco, CA',
        bio: 'Architecting autonomous, high-resilient systems that redefine human-machine collaboration.',
        jobTitle: 'Elite Solutions Architect',
        currentCompany: 'Kaarya.OS',
        linkedin: 'linkedin.com/in/nikhil',
        github: 'github.com/nikhil',
        skills: ['Distributed Systems', 'FastAPI', 'Next.js', 'PostgreSQL', 'Kubernetes'],
      });
    }
  }, []);

  if (!profile) return null;

  // Derive display values based on role
  let displayName = profile.fullName || profile.companyName || profile.collegeName || 'Unknown User';
  let displayTitle = profile.jobTitle || profile.industry || profile.affiliation || 'Kaarya User';
  let displayBio = profile.bio || 'No bio provided.';
  let displayPic = profile.profilePic || profile.logo;
  let displayLocation = profile.location || 'Unknown Location';
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
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Profile Header */}
      <div className="relative">
         <div className="h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-primary rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
            <button className="absolute bottom-6 right-8 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center space-x-2">
               <Camera className="h-4 w-4" />
               <span>Update Cover</span>
            </button>
         </div>

         <div className="px-12 -mt-24 relative z-10 flex flex-col md:flex-row items-end gap-10">
            <div className="relative group">
               <div className="w-48 h-48 rounded-[3rem] bg-card border-[6px] border-background shadow-2xl overflow-hidden flex items-center justify-center relative">
                  {displayPic ? (
                    <img src={displayPic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-6xl font-black">
                       {getInitials(displayName)}
                    </div>
                  )}
               </div>
               <button className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Edit3 className="h-5 w-5" />
               </button>
            </div>
            
            <div className="flex-1 pb-4">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                     <h1 className="text-5xl font-black tracking-tight flex items-center gap-4 uppercase">
                        {displayName}
                        <CheckCircle2 className="h-8 w-8 text-blue-500" />
                     </h1>
                     <p className="text-xl font-bold text-muted-foreground mt-2 uppercase tracking-widest flex items-center opacity-80">
                        {displayTitle} {profile.currentCompany ? `• ${profile.currentCompany}` : ''}
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
                        <Share2 className="h-4 w-4" />
                        <span>Broadcast Profile</span>
                     </button>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-6 mt-8">
                  <ContactItem icon={Mail} value={`${displayName.split(' ')[0].toLowerCase()}@kaarya.os`} />
                  <ContactItem icon={MapPin} value={displayLocation} />
                  {profile.linkedin && <ContactItem icon={Linkedin} value={profile.linkedin} />}
                  {profile.github && <ContactItem icon={Github} value={profile.github} />}
                  {profile.website && <ContactItem icon={Globe} value={profile.website} />}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Left Column: Stats & Skills */}
         <div className="space-y-12">
            {/* Performance Matrix */}
            <div className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 space-y-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  {role === 'company' ? 'Company Metrics' : 'Elite Performance Matrix'}
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  {role === 'company' ? (
                    <>
                      <StatCard label="Hired" value="24" color="text-primary" />
                      <StatCard label="Response Rate" value="98%" color="text-emerald-500" />
                      <StatCard label="Rating" value="4.9/5" color="text-amber-500" />
                    </>
                  ) : (
                    <>
                      <StatCard label="Hireability" value="94.8%" color="text-primary" />
                      <StatCard label="Technical" value="Elite" color="text-emerald-500" />
                      <StatCard label="Comms" value="96/100" color="text-blue-500" />
                      <StatCard label="Labs" value="Top 1%" color="text-amber-500" />
                    </>
                  )}
               </div>
            </div>

            {/* Specialties */}
            {displayTags.length > 0 && (
              <div className="bg-card border border-border rounded-[2.5rem] shadow-xl p-8 space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center">
                    <Code2 className="h-4 w-4 mr-2" />
                    Core Specialties / Tags
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {displayTags.map((s: string) => (
                      <span key={s} className="px-4 py-2 bg-secondary/60 border border-border rounded-xl text-xs font-bold tracking-tight hover:bg-primary/5 hover:border-primary/20 transition-all cursor-default">
                         {s}
                      </span>
                    ))}
                 </div>
              </div>
            )}
         </div>

         {/* Center/Right: Experience & Legacy */}
         <div className="lg:col-span-2 space-y-12">
            {/* Mission Statement */}
            <div className="p-10 bg-secondary/30 rounded-[3rem] border border-border relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Star className="h-32 w-32" />
               </div>
               <h3 className="text-xl font-black tracking-tight mb-4 uppercase">
                 {role === 'company' ? 'Company Vision' : 'Mission Statement'}
               </h3>
               <p className="text-lg font-medium leading-relaxed italic text-muted-foreground/80">
                 "{displayBio}"
               </p>
            </div>

            {/* Workforce Legacy / Details based on role */}
            {role === 'candidate' || role === 'trainer' ? (
              <div className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Workforce Legacy</h3>
                    <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Update Records</button>
                 </div>
                 <div className="space-y-6">
                    <LegacyItem 
                      role={profile.jobTitle || 'Founding Engineer'} 
                      company={profile.currentCompany || 'NikVerse AI'} 
                      period={profile.yearsExperience ? `${profile.yearsExperience} years` : '2024 - Present'} 
                      desc="Leading the development of complex architectures and systems." 
                    />
                 </div>
              </div>
            ) : role === 'company' ? (
              <div className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Active Roles</h3>
                 </div>
                 <div className="space-y-6">
                    {profile.rolesHired && profile.rolesHired.map((roleTitle: string, idx: number) => (
                      <LegacyItem 
                        key={idx}
                        role={roleTitle} 
                        company={profile.companyName} 
                        period="Actively Hiring" 
                        desc="Looking for top talent in this domain. Connect with us to learn more." 
                      />
                    ))}
                 </div>
              </div>
            ) : null}

            {/* Foundation */}
            {(role === 'candidate' || role === 'college') && (
              <div className="space-y-8">
                 <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      {role === 'college' ? 'Institution Highlights' : 'Educational Foundation'}
                    </h3>
                 </div>
                 <div className="bg-card border border-border rounded-[2rem] p-8 flex items-center space-x-6 hover:bg-secondary/20 transition-all cursor-default">
                    <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
                       <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tight">
                         {role === 'college' ? (profile.streams?.[0] || 'Engineering') : (profile.degree || 'Computer Science')}
                       </h4>
                       <p className="text-sm font-bold opacity-70">
                         {role === 'college' ? profile.collegeName : (profile.college || 'Stanford Academy')}
                       </p>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                         {profile.gradYear ? `Class of ${profile.gradYear}` : 'Alumni'}
                       </p>
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, value }: any) {
  return (
    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
       <Icon className="h-4 w-4 opacity-60 group-hover:opacity-100" />
       <span>{value}</span>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="p-4 bg-secondary/30 border border-border rounded-2xl flex flex-col items-center justify-center text-center group hover:scale-105 transition-all">
       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 group-hover:text-primary">{label}</span>
       <span className={`text-xl font-black tracking-tighter ${color}`}>{value}</span>
    </div>
  );
}

function LegacyItem({ role, company, period, desc }: any) {
  return (
    <div className="p-8 bg-card border border-border rounded-[2.5rem] relative group hover:border-primary/30 transition-all shadow-sm hover:shadow-xl">
       <div className="flex justify-between items-start mb-4">
          <div className="p-4 bg-primary/5 rounded-[1.5rem] text-primary">
             <Briefcase className="h-6 w-6" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-secondary text-muted-foreground rounded-full border border-border">
             {period}
          </div>
       </div>
       <h4 className="text-2xl font-black tracking-tight uppercase mb-1">{role}</h4>
       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 opacity-80">{company}</p>
       <p className="text-sm font-medium leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
