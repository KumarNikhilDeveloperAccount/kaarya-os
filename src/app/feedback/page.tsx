'use client';

import { useState } from 'react';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_FEEDBACK = [
  { id: 1, candidate: 'Alex Rivera', role: 'Frontend Engineer', score: 92, feedback: 'Excellent grasp of React fundamentals and system design. Communication was clear and concise.', rating: 5, date: '2026-05-31' },
  { id: 2, candidate: 'Sarah Chen', role: 'Backend Engineer', score: 85, feedback: 'Strong Python skills, but struggled slightly with the deep architectural database scaling question.', rating: 4, date: '2026-05-30' },
  { id: 3, candidate: 'Jordan Lee', role: 'DevOps Engineer', score: 95, feedback: 'Exceptional performance across the board. Highly recommended for the senior position.', rating: 5, date: '2026-05-28' },
];

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACK);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-primary" /> Interview Feedback
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Review AI assessments and human interviewer feedback.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-xl focus:border-primary/50 outline-none text-sm"
            />
          </div>
          <button className="px-4 py-2 bg-secondary rounded-xl border border-border hover:border-primary/50 transition-all flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((item) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={item.id} 
            className="bg-card border border-border rounded-[2rem] p-6 shadow-xl flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{item.candidate}</h3>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < item.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                ))}
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-6">
              "{item.feedback}"
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                Score: {item.score}/100
              </span>
              <div className="flex space-x-2">
                <button className="p-2 bg-secondary rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button className="p-2 bg-secondary rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
