'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Award, Briefcase, 
  Sparkles, TrendingUp, Filter, Send, Image as ImageIcon,
  MoreHorizontal
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await api.get('/api/ecosystem/feed');
        setPosts(response.data);
      } catch (e) {
        console.error("Feed load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      const response = await api.post('/api/ecosystem/feed', {
        content: newPost,
        post_type: 'update'
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
            <TrendingUp className="h-8 w-8 mr-3 text-primary" /> Network Pulse
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Real-time professional ecosystem updates.</p>
        </div>
        <button className="p-3 bg-secondary rounded-2xl border border-border hover:border-primary/50 transition-all">
          <Filter className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Create Post */}
          <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-xl flex flex-col space-y-4">
             <div className="flex space-x-4">
                <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden border border-border shrink-0">
                   {/* @ts-ignore */}
                   {user?.profile_picture ? (
                      <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary">
                        {user?.full_name?.charAt(0) || 'U'}
                      </div>
                   )}
                </div>
                <textarea 
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Share an engineering milestone, an architectural decision, or a placement win..."
                  className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm font-medium pt-2 outline-none h-20 placeholder:text-muted-foreground/50"
                />
             </div>
             <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex space-x-2">
                   <button className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
                     <ImageIcon className="h-5 w-5" />
                   </button>
                   <button className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors">
                     <Briefcase className="h-5 w-5" />
                   </button>
                </div>
                <button 
                  onClick={handlePost}
                  disabled={!newPost.trim()}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="h-4 w-4" />
                </button>
             </div>
          </div>

          {/* Feed */}
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Ecosystem</p>
             </div>
          ) : (
             <AnimatePresence>
               {posts.map((post) => (
                 <motion.div 
                   key={post.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-card border border-border rounded-[2.5rem] p-8 shadow-lg hover:shadow-xl transition-all"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex space-x-4">
                          <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden shrink-0 border border-border">
                             {post.author?.profile_picture ? (
                                <img src={post.author.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary">
                                  {post.author?.full_name?.charAt(0) || 'K'}
                                </div>
                             )}
                          </div>
                          <div>
                             <h4 className="font-bold">{post.author?.full_name || 'Kaarya User'}</h4>
                             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                               {new Date(post.created_at).toLocaleDateString()} • {post.post_type}
                             </p>
                          </div>
                       </div>
                       <button className="p-2 hover:bg-secondary rounded-xl transition-colors"><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></button>
                    </div>
                    
                    <p className="text-sm font-medium leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.media_url && (
                      <div className="rounded-2xl overflow-hidden mb-6 border border-border">
                         <img src={post.media_url} alt="Post media" className="w-full h-auto object-cover" />
                      </div>
                    )}

                    <div className="flex items-center space-x-6 pt-4 border-t border-border/50">
                       <button className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors group">
                          <div className="p-2 rounded-full group-hover:bg-red-500/10"><Heart className="h-4 w-4" /></div>
                          <span className="text-xs font-bold">{post.likes_count}</span>
                       </button>
                       <button className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors group">
                          <div className="p-2 rounded-full group-hover:bg-blue-500/10"><MessageCircle className="h-4 w-4" /></div>
                          <span className="text-xs font-bold">{post.comments_count}</span>
                       </button>
                       <button className="flex items-center space-x-2 text-muted-foreground hover:text-emerald-500 transition-colors group ml-auto">
                          <div className="p-2 rounded-full group-hover:bg-emerald-500/10"><Share2 className="h-4 w-4" /></div>
                       </button>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 rounded-[2rem] p-6">
              <h3 className="font-black text-sm uppercase tracking-widest flex items-center mb-4">
                 <Sparkles className="h-4 w-4 mr-2 text-primary" /> Trending Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                 {['Rust', 'Distributed Systems', 'Next.js 15', 'AI Architecture', 'PostgreSQL'].map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-background rounded-lg text-[10px] font-bold uppercase tracking-widest border border-border">{skill}</span>
                 ))}
              </div>
           </div>
           
           <div className="bg-card border border-border rounded-[2rem] p-6 shadow-xl">
              <h3 className="font-black text-sm uppercase tracking-widest mb-4">Top Placements</h3>
              <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border shrink-0">
                          <Award className="h-5 w-5 text-amber-500" />
                       </div>
                       <div>
                          <p className="text-xs font-bold">Senior Engineer placed</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">at NikVerse AI</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
