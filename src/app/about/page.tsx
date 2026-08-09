'use client';

import { motion } from 'framer-motion';
import { 
  Globe, 
  Lightbulb, 
  Target, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Users, 
  TrendingUp, 
  MessageCircle, 
  Link as LinkIcon 
} from 'lucide-react';
import Image from 'next/image';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-50 -z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 text-sm font-semibold tracking-wide">
              <span>About Kaarya.OS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
              Hiring.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-focus italic">
                Decided.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Kaarya.OS is not merely another job portal or applicant tracking system. It is an intelligent hiring ecosystem designed to bring together candidates, recruiters, companies, educational institutions, interviewers, trainers, and AI into a single connected platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-24">
        
        {/* Why Kaarya.OS Was Built */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-secondary rounded-xl"><Lightbulb className="h-6 w-6 text-primary" /></div>
            <h2 className="text-3xl font-bold tracking-tight">Why Kaarya.OS Was Built</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Recruitment has evolved dramatically over the past decade, yet the experience remains fragmented for almost everyone involved. Candidates spend countless hours maintaining resumes across multiple websites, tracking applications manually, and communicating through scattered channels. Recruiters face similar challenges by switching between applicant tracking systems, spreadsheets, messaging platforms, and scheduling tools simply to fill a single position.
          </p>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Kaarya.OS was born from the realization that hiring deserves an operating system rather than another standalone application. The goal was to build an ecosystem where professional identity, hiring, networking, communication, AI, assessments, learning, and collaboration coexist seamlessly.
          </p>
        </motion.section>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-12">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-4 p-8 rounded-3xl bg-secondary/30 border border-border/50">
            <Target className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-2xl font-bold">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our vision is to redefine how the world experiences hiring by building the most intelligent, trusted, and connected career ecosystem. We envision a future where finding opportunities, evaluating talent, and making hiring decisions happen within a unified environment. Success is measured by the quality of connections created and the careers advanced.
            </p>
          </motion.section>
          
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-4 p-8 rounded-3xl bg-secondary/30 border border-border/50">
            <Globe className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-2xl font-bold">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to simplify hiring through technology that remains human at its core. We strive to create experiences that are intuitive, transparent, and genuinely useful. By combining thoughtful design, responsible AI, and collaborative workflows, Kaarya.OS empowers candidates, recruiters, companies, and educators alike.
            </p>
          </motion.section>
        </div>

        {/* What Makes Us Different */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-secondary rounded-xl"><Cpu className="h-6 w-6 text-primary" /></div>
            <h2 className="text-3xl font-bold tracking-tight">What Makes Kaarya.OS Different</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Kaarya.OS is not designed to compete by copying existing platforms. Instead, it seeks to unify capabilities that are scattered across multiple products. Professional networking, AI-assisted guidance, structured workflows, candidate assessments, recruiter collaboration, and career development come together within one cohesive environment. Rather than replacing human judgment, Kaarya.OS augments it by providing better information and context.
          </p>
        </motion.section>

        {/* Ecosystem & Philosophy */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">The Ecosystem & Product Philosophy</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              The platform is designed around interconnected communities rather than a single type of user. Each role has its own experience, yet every interaction contributes to a shared professional ecosystem. Technology should never become an obstacle between people and opportunity. Every feature introduced must solve a meaningful problem and create measurable value. Features that merely imitate competitors without improving the experience have no place here.
            </p>
            <p>
              Many professional platforms excel at one area—networking, job discovery, ATS, or assessments. This specialization has created fragmentation. Kaarya.OS takes a different approach by bringing these experiences together to reduce friction.
            </p>
          </div>
        </motion.section>

        {/* AI, Privacy & Data */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="p-6 rounded-2xl bg-card border border-border shadow-sm">
            <Cpu className="h-6 w-6 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Artificial Intelligence</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI is deeply integrated into Kaarya.OS to support—not replace—human expertise. It helps navigate the platform, analyze resumes, assist recruiters, and simplify repetitive tasks while preserving transparency and human judgment.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="p-6 rounded-2xl bg-card border border-border shadow-sm">
            <ShieldCheck className="h-6 w-6 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Privacy & Security</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Professional information deserves responsible stewardship. Kaarya.OS is built with a privacy-first mindset, emphasizing transparency, user control, and strong security practices throughout the platform.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="p-6 rounded-2xl bg-card border border-border shadow-sm">
            <Database className="h-6 w-6 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Data Processing</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We process information only to deliver and improve our services. We aim to minimize unnecessary data collection, provide users with meaningful control, and we absolutely do not sell personal information to third parties.
            </p>
          </motion.div>
        </div>

        {/* Community & Continuous Improvement */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-secondary rounded-xl"><Users className="h-6 w-6 text-primary" /></div>
            <h2 className="text-3xl font-bold tracking-tight">Community & Trust</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Trust is earned through consistent behavior rather than promises. We strive to be accountable and transparent about how our platform works. Kaarya.OS is more than software; it is a community of professionals, organizations, educators, and recruiters sharing a common goal. We encourage constructive feedback and knowledge sharing because stronger communities create stronger careers. We remain committed to listening, learning, and continuously improving the platform with purpose.
          </p>
          
          <div className="mt-8 p-6 bg-secondary/20 border border-border/50 rounded-2xl">
             <h3 className="text-xl font-bold mb-4">Follow Our Journey</h3>
             <p className="text-muted-foreground mb-6">Join the Kaarya.OS community on social media to stay updated on our progress, platform updates, and hiring insights.</p>
             <div className="flex flex-wrap gap-4">
                <a href="https://x.com/kaaryaos" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-background border border-border rounded-xl font-medium hover:border-primary hover:text-primary transition-colors flex items-center space-x-2">
                   <span>X (Twitter)</span>
                </a>
                <a href="https://www.instagram.com/kaarya.os/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-background border border-border rounded-xl font-medium hover:border-primary hover:text-primary transition-colors flex items-center space-x-2">
                   <span>Instagram</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61592154552233" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-background border border-border rounded-xl font-medium hover:border-primary hover:text-primary transition-colors flex items-center space-x-2">
                   <span>Facebook</span>
                </a>
                <a href="https://www.youtube.com/channel/UCsE6OXZTd9bgaSbJBL-sLmw" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-background border border-border rounded-xl font-medium hover:border-primary hover:text-primary transition-colors flex items-center space-x-2">
                   <span>YouTube</span>
                </a>
                <a href="https://www.linkedin.com/company/124064015/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-background border border-border rounded-xl font-medium hover:border-primary hover:text-primary transition-colors flex items-center space-x-2">
                   <span>LinkedIn</span>
                </a>
             </div>
          </div>
        </motion.section>

        <hr className="border-border/50" />

        {/* Meet the Founder Section */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Meet the Founder</h2>
            <p className="text-muted-foreground">The vision driving Kaarya.OS</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Minimalist Profile Card */}
            <div className="w-full md:w-1/3 shrink-0 rounded-3xl overflow-hidden border border-border/50 bg-secondary/20 p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center border-4 border-background shadow-xl">
                 {/* Placeholder for Founder Image */}
                 <span className="text-5xl font-black text-primary/50">KN</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Kumar Nikhil</h3>
                <p className="text-primary font-medium mt-1">Founder & CEO</p>
              </div>
              <div className="flex space-x-4 pt-4 border-t border-border/50 w-full justify-center">
                 <LinkIcon className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                 <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              </div>
            </div>

            <div className="w-full md:w-2/3 space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                <strong className="text-foreground">Kumar Nikhil</strong> is the Founder and Chief Executive Officer of Kaarya.OS, an AI-powered hiring and career operating system built to simplify how talent, organizations, recruiters, educational institutions, and professionals connect in an increasingly fragmented landscape.
              </p>
              <p>
                With a professional background in enterprise IT infrastructure, identity and access management, IT service management, and large-scale operational support, Kumar has spent years working with complex enterprise environments where reliability, security, and operational excellence are fundamental requirements. He observed how organizations invest heavily in technology to optimize operations, while hiring often remains spread across disconnected systems and fragmented experiences.
              </p>
              <p>
                That realization became the foundation for Kaarya.OS. Rather than creating another job board, Kumar envisioned a unified ecosystem where professional identity, networking, AI, and career development coexist. As CEO, he leads the long-term product vision, emphasizing systems that are dependable, transparent, and genuinely useful.
              </p>
              <p>
                For Kumar, success is not measured solely by platform growth. It is measured by the careers advanced, the opportunities created, the organizations strengthened, and the lasting professional relationships that begin through Kaarya.OS.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Founder's Note (Letter format) */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="pt-8">
          <div className="max-w-3xl mx-auto bg-card border border-border shadow-lg rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Lightbulb className="w-32 h-32" />
            </div>
            
            <h3 className="text-2xl font-bold mb-8 text-foreground font-serif italic">A Note From Our Founder</h3>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed font-serif text-lg">
              <p>
                When I first began thinking about Kaarya.OS, I wasn't trying to build another hiring platform. I was trying to understand why something as important as building a career or hiring great people had become so fragmented.
              </p>
              <p>
                Candidates often maintain multiple resumes, profiles, and applications across different websites. Recruiters work across disconnected systems to source talent, communicate, schedule interviews, and evaluate assessments. Despite advances in technology, much of the hiring journey still feels unnecessarily complex.
              </p>
              <p>
                Kaarya.OS was created with a simple belief: <strong>technology should reduce complexity, not create it.</strong>
              </p>
              <p>
                From the very beginning, my goal has been to build a platform that connects people rather than separates them—an ecosystem where professional identity, hiring, communication, networking, assessments, and AI work together. I believe every feature should solve a genuine problem, and every interaction should contribute to helping someone move forward.
              </p>
              <p>
                Building Kaarya.OS has been a journey of continuous learning. Every conversation with a user, every bug report, and every improvement has helped shape the platform into what it is today. We do not view feedback as criticism; we view it as collaboration. 
              </p>
              <p>
                As AI evolves, our responsibility is to apply it thoughtfully. AI should assist people, provide meaningful insights, and reduce repetitive work while preserving human judgment and accountability.
              </p>
              <p>
                This is only the beginning of the journey. Kaarya.OS will continue to evolve, guided by our users, inspired by innovation, and grounded in the belief that better hiring creates stronger organizations, stronger careers, and stronger communities.
              </p>
              <p>
                Thank you for being part of this journey. Your trust and support are helping shape the future of how people connect with opportunity.
              </p>
              
              <div className="mt-8">
                 <p className="text-sm font-sans not-italic font-bold">Contact our official support desk:</p>
                 <a href="mailto:kaarya.support@gmail.com" className="text-primary hover:underline text-sm font-sans not-italic font-medium">kaarya.support@gmail.com</a>
              </div>
              
              <div className="mt-8 pt-8 border-t border-border/50">
                <p className="text-foreground font-bold text-xl font-sans not-italic">Kumar Nikhil</p>
                <p className="text-primary text-sm font-sans not-italic uppercase tracking-widest mt-1">Founder & CEO, Kaarya.OS</p>
              </div>
            </div>
          </div>
        </motion.section>
        
      </div>
    </div>
  );
}
