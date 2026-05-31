'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Star, MapPin, DollarSign, Hexagon, 
  Target, Rocket, ShieldCheck, UserPlus, FileText,
  ChevronRight, Compass, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function OrbitPage() {
  const { user } = useAuth();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
     // Generate mock jobs orbiting the user
     const generateOrbit = () => {
        const orbitData = [];
        const rings = 3;
        const nodesPerRing = [4, 6, 8];
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
        
        let idCounter = 1;
        for (let ring = 1; ring <= rings; ring++) {
           const numNodes = nodesPerRing[ring - 1];
           const radius = ring * 120 + 50; // pixels
           const speed = 20 + ring * 10; // seconds for full rotation
           
           for (let i = 0; i < numNodes; i++) {
              const startAngle = (i / numNodes) * 360;
              orbitData.push({
                 id: idCounter++,
                 ring,
                 radius,
                 speed,
                 startAngle,
                 color: colors[Math.floor(Math.random() * colors.length)],
                 role: ["Senior Backend Eng", "Staff Prod Manager", "Lead Designer", "AI Architect", "Rust Dev"][Math.floor(Math.random() * 5)],
                 company: ["TechCorp", "NikVerse AI", "GlobalSys", "FinTech Inc", "Kaarya Partner"][Math.floor(Math.random() * 5)],
                 salary: ["$150k-$180k", "$200k+", "$120k-$150k", "Equity Heavy"][Math.floor(Math.random() * 4)],
                 matchScore: Math.floor(Math.random() * 30) + 70, // 70-99
              });
           }
        }
        setNodes(orbitData);
     };
     
     generateOrbit();
  }, []);

  return (
    <div className="h-[calc(100vh-100px)] w-full overflow-hidden bg-[#0a0a0c] relative flex items-center justify-center font-sans">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0c_80%)] pointer-events-none" />

       {/* Top Info Bar */}
       <div className="absolute top-8 left-8 right-8 z-50 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center">
                <Compass className="h-8 w-8 text-primary mr-3" />
                Opportunity Orbit
             </h1>
             <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">Spatial Job Discovery Engine</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 pointer-events-auto">
             <div className="flex items-center space-x-6 text-white">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detected Nodes</p>
                   <p className="text-xl font-bold">{nodes.length}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">High Match</p>
                   <p className="text-xl font-bold text-emerald-500">{nodes.filter(n => n.matchScore >= 90).length}</p>
                </div>
             </div>
          </div>
       </div>

       {/* Orbit Visualization Area */}
       <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
          {/* Central User Node */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute z-40 flex flex-col items-center justify-center cursor-pointer"
          >
             <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                <div className="w-24 h-24 bg-card border-4 border-primary rounded-full overflow-hidden relative z-10 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                   {user?.profile_picture ? (
                      <img src={user.profile_picture} alt="You" className="w-full h-full object-cover" />
                   ) : (
                      <UserPlus className="h-8 w-8 text-primary" />
                   )}
                </div>
                {/* Sonar rings */}
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.5, scale: 1 }}
                    animate={{ opacity: 0, scale: 3 + i }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                    className="absolute inset-0 rounded-full border border-primary/50 pointer-events-none"
                  />
                ))}
             </div>
             <div className="mt-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                <p className="text-white text-xs font-black uppercase tracking-widest">{user?.full_name || 'Your Profile'}</p>
             </div>
          </motion.div>

          {/* Orbit Rings & Nodes */}
          {nodes.map((node) => (
             <motion.div
                key={node.id}
                className="absolute left-1/2 top-1/2 origin-top-left"
                animate={{ rotate: 360 }}
                transition={{ duration: node.speed, repeat: Infinity, ease: "linear" }}
                style={{
                  width: node.radius * 2,
                  height: node.radius * 2,
                  marginLeft: -node.radius,
                  marginTop: -node.radius,
                }}
             >
                {/* Ring Line */}
                <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
                
                {/* Individual Job Node */}
                <motion.div
                   className="absolute group cursor-pointer"
                   style={{
                      left: '50%',
                      top: 0,
                      marginLeft: -16, // half of w-8
                      marginTop: -16, // half of h-8
                      rotate: node.startAngle,
                      transformOrigin: `16px ${node.radius + 16}px`
                   }}
                   whileHover={{ scale: 1.5, zIndex: 50 }}
                   onClick={() => setSelectedNode(node)}
                >
                   {/* Counter-rotate to keep icon upright */}
                   <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: node.speed, repeat: Infinity, ease: "linear" }}
                      className="relative"
                   >
                      <div className="w-8 h-8 rounded-full border-2 border-background shadow-xl flex items-center justify-center relative z-10 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-shadow" style={{ backgroundColor: node.color }}>
                         <Hexagon className="h-4 w-4 text-white fill-current" />
                      </div>
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl pointer-events-none">
                         <p className="text-white text-[10px] font-black uppercase tracking-widest">{node.company}</p>
                         <p className="text-emerald-400 text-[10px] font-bold">{node.matchScore}% Match</p>
                      </div>
                   </motion.div>
                </motion.div>
             </motion.div>
          ))}
       </div>

       {/* Selected Node Details Panel */}
       <AnimatePresence>
          {selectedNode && (
             <motion.div
                initial={{ opacity: 0, x: 400 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 400 }}
                className="absolute top-8 bottom-8 right-8 w-96 bg-[#0f0f13]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 flex flex-col z-50"
             >
                <div className="flex justify-between items-start mb-8">
                   <div 
                     className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                     style={{ backgroundColor: `${selectedNode.color}20`, border: `1px solid ${selectedNode.color}50` }}
                   >
                      <Hexagon className="h-8 w-8" style={{ color: selectedNode.color }} />
                   </div>
                   <button 
                     onClick={() => setSelectedNode(null)}
                     className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                   >
                      <X className="h-5 w-5" />
                   </button>
                </div>

                <div className="space-y-1 mb-8">
                   <h2 className="text-2xl font-black text-white leading-tight">{selectedNode.role}</h2>
                   <p className="text-primary font-bold uppercase tracking-widest text-xs flex items-center">
                      <Briefcase className="h-3 w-3 mr-1.5" /> {selectedNode.company}
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Rit Match</p>
                      <p className="text-xl font-black text-emerald-400 flex items-center">
                        {selectedNode.matchScore}% <Target className="h-4 w-4 ml-1.5 opacity-50" />
                      </p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Compensation</p>
                      <p className="text-lg font-bold text-white flex items-center">
                        {selectedNode.salary}
                      </p>
                   </div>
                </div>

                <div className="space-y-4 flex-1">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Match Insights</h3>
                   <ul className="space-y-3">
                      <li className="flex items-start text-sm text-white/80 font-medium">
                         <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 mt-0.5 shrink-0" /> 
                         Your distributed systems experience aligns perfectly with their Q3 roadmap.
                      </li>
                      <li className="flex items-start text-sm text-white/80 font-medium">
                         <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500 mt-0.5 shrink-0" /> 
                         Cultural overlap detected via LinkedIn endorsements.
                      </li>
                      <li className="flex items-start text-sm text-white/80 font-medium">
                         <Star className="h-4 w-4 mr-2 text-amber-500 mt-0.5 shrink-0" /> 
                         Missing keyword: "GraphQL". Consider reviewing before interview.
                      </li>
                   </ul>
                </div>

                <div className="pt-6 border-t border-white/10 mt-auto">
                   <button className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center">
                      Engage Node <Rocket className="h-4 w-4 ml-2" />
                   </button>
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}
