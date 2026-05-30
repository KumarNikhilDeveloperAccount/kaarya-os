'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, Users, Code2, Filter } from 'lucide-react';
import { getProfileData } from '@/lib/store';

const MOCK_COMPANIES = [
  {
    id: '1',
    companyName: 'Acme Corp',
    industry: 'Technology & Software',
    location: 'San Francisco, CA',
    techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
    bio: 'Building the next generation of cloud infrastructure and developer tools for the modern web.',
    companySize: '51-200'
  },
  {
    id: '2',
    companyName: 'Global FinCore',
    industry: 'Finance & Fintech',
    location: 'New York, NY',
    techStack: ['Python', 'Go', 'Kubernetes', 'Kafka'],
    bio: 'Redefining global transaction settlements with ultra-low latency architectures.',
    companySize: '201-500'
  },
  {
    id: '3',
    companyName: 'HealthAI',
    industry: 'Healthcare',
    location: 'Boston, MA',
    techStack: ['PyTorch', 'TensorFlow', 'React', 'AWS'],
    bio: 'Leveraging artificial intelligence to accelerate drug discovery and improve patient outcomes.',
    companySize: '11-50'
  }
];

export default function PartnersPage() {
  const [companies, setCompanies] = useState<any[]>(MOCK_COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // If the active user has a company profile in localStorage, prepend it to the mock list
    const companyProfile = getProfileData('company');
    if (companyProfile && companyProfile.companyName) {
      setCompanies([
        {
          id: 'user',
          ...companyProfile,
        },
        ...MOCK_COMPANIES
      ]);
    }
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    if (!name) return 'C';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Company Directory</h1>
          <p className="text-muted-foreground mt-2">Explore elite organizations hiring on Kaarya.OS.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button className="p-2 border border-border bg-card rounded-xl hover:bg-secondary transition-colors">
             <Filter className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={company.id} 
            className="bg-card border border-border rounded-[2rem] p-6 hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-secondary border-2 border-background shadow-md overflow-hidden flex items-center justify-center shrink-0">
                {company.logo ? (
                  <img src={company.logo} alt={company.companyName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xl font-black">
                     {getInitials(company.companyName)}
                  </div>
                )}
              </div>
              <div className="px-3 py-1 bg-secondary text-muted-foreground rounded-full text-xs font-black uppercase tracking-widest border border-border">
                {company.industry || 'Technology'}
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-black tracking-tight">{company.companyName}</h3>
              <div className="flex items-center space-x-3 text-xs font-semibold text-primary uppercase tracking-wider">
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {company.location || 'Remote'}</span>
                {company.companySize && <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {company.companySize}</span>}
              </div>
            </div>

            <div className="mb-6 flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {company.bio}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border">
              {company.techStack && company.techStack.slice(0, 3).map((tech: string) => (
                <span key={tech} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary">
                  {tech}
                </span>
              ))}
              {company.techStack && company.techStack.length > 3 && (
                <span className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary">
                  +{company.techStack.length - 3}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
