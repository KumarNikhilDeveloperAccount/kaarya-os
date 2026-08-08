import { Github, Twitter, Linkedin, Facebook, Instagram, ArrowRight, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand & Vision */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
               <Sparkles className="h-4 w-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">About The Vision</span>
            </div>
            <h3 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Kaarya OS.
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Kaarya OS was built by <strong className="text-foreground">Nikhil Kashyap</strong> to solve the fragmented, chaotic reality of modern recruitment. By unifying adaptive assessments, secured sandboxes, and autonomous AI vetting into a single intelligent operating system, Kaarya doesn't just manage hiring—it decides it.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <Link href="https://twitter.com/kaaryaos" target="_blank" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="https://linkedin.com/company/kaarya-os" target="_blank" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="https://instagram.com/kaaryaos" target="_blank" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="https://facebook.com/kaaryaos" target="_blank" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-bold tracking-widest uppercase text-xs text-muted-foreground">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/candidates" className="text-sm font-medium hover:text-primary transition-colors">For Candidates</Link></li>
              <li><Link href="/employers" className="text-sm font-medium hover:text-primary transition-colors">For Employers</Link></li>
              <li><Link href="/colleges" className="text-sm font-medium hover:text-primary transition-colors">For Institutions</Link></li>
              <li><Link href="/experts" className="text-sm font-medium hover:text-primary transition-colors">For Experts</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="font-bold tracking-widest uppercase text-xs text-muted-foreground">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">Documentation</Link></li>
              <li><button className="text-sm font-medium hover:text-primary transition-colors">Help Center</button></li>
              <li><Link href="/privacy" className="text-sm font-medium hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-medium hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Kaarya OS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-medium flex items-center mt-4 md:mt-0">
            Built with <Heart className="w-3 h-3 text-red-500 mx-1" /> for the future of work.
          </p>
        </div>
      </div>
    </footer>
  );
}
