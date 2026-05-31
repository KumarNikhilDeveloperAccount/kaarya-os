'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Target, Zap, 
  Activity, ArrowUpRight, CheckCircle2, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { api } from '@/lib/api';

const mockChartData = [
  { name: 'Mon', applicants: 120, simulated: 80, placed: 20 },
  { name: 'Tue', applicants: 150, simulated: 110, placed: 35 },
  { name: 'Wed', applicants: 200, simulated: 160, placed: 45 },
  { name: 'Thu', applicants: 180, simulated: 140, placed: 40 },
  { name: 'Fri', applicants: 250, simulated: 210, placed: 65 },
  { name: 'Sat', applicants: 300, simulated: 260, placed: 90 },
  { name: 'Sun', applicants: 280, simulated: 240, placed: 85 },
];

const mockSkillData = [
  { name: 'System Design', score: 85 },
  { name: 'React', score: 92 },
  { name: 'Python', score: 78 },
  { name: 'DevOps', score: 65 },
  { name: 'Algorithms', score: 88 },
];

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_applicants: 1480,
    simulations_run: 1190,
    avg_score: 82,
    placements: 380,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/dashboard/analytics');
        if (response.data && response.data.stats) {
            setStats(response.data.stats);
        }
      } catch (e) {
        console.error("Using fallback analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
            <Activity className="h-8 w-8 mr-3 text-primary" /> Analytics Center
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Real-time signal tracking and performance telemetry.</p>
        </div>
        <button className="px-6 py-2.5 bg-secondary text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-secondary/80 transition-all flex items-center border border-border">
          Last 7 Days <ChevronDown className="h-4 w-4 ml-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Sourced" 
          value={stats.total_applicants.toString()} 
          icon={<Users className="h-5 w-5 text-blue-500" />} 
          trend="+12%" 
        />
        <StatCard 
          title="Rit.AI Simulations" 
          value={stats.simulations_run.toString()} 
          icon={<Zap className="h-5 w-5 text-amber-500" />} 
          trend="+24%" 
        />
        <StatCard 
          title="Avg. Quality Score" 
          value={`${stats.avg_score}/100`} 
          icon={<Target className="h-5 w-5 text-emerald-500" />} 
          trend="+3%" 
        />
        <StatCard 
          title="Active Placements" 
          value={stats.placements.toString()} 
          icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />} 
          trend="+18%" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-card border border-border rounded-[2rem] p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black uppercase tracking-widest">Hiring Funnel Velocity</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="applicants" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApplicants)" />
                <Area type="monotone" dataKey="simulated" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSimulated)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl flex flex-col">
          <h2 className="text-lg font-black uppercase tracking-widest mb-8">Skill Proficiency</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSkillData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" width={80} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px' }}
                />
                <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <div className="bg-card border border-border rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden group hover:border-primary/50 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-all" />
      <div className="flex justify-between items-start mb-4 relative">
        <div className="p-3 bg-secondary rounded-xl border border-border/50">
          {icon}
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px] font-black tracking-widest">
          <ArrowUpRight className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      </div>
      <div className="relative">
        <h3 className="text-3xl font-black tracking-tighter text-foreground">{value}</h3>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}
