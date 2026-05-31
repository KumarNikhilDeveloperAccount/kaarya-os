'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Volume2, VolumeX, 
  Play, Pause, Briefcase, PlusCircle, CheckCircle2,
  ChevronDown, ChevronUp, UserPlus
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await api.get('/api/ecosystem/reels');
        // If the backend returns empty or few, we mock some for the demo
        const fetchedReels = response.data;
        if (fetchedReels.length < 3) {
            setReels([
               ...fetchedReels,
               {
                 id: 991,
                 video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                 caption: "How I architected a multi-region highly available PostgreSQL cluster. #SystemDesign",
                 tags: "Engineering",
                 likes_count: 1240,
                 comments_count: 89,
                 author: { full_name: "Sarah Chen", profile_picture: "" }
               },
               {
                 id: 992,
                 video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                 caption: "My journey from bootcamp to Senior Frontend Engineer in 3 years. Focus on core JS! #Career",
                 tags: "Frontend",
                 likes_count: 5630,
                 comments_count: 421,
                 author: { full_name: "Alex Rivera", profile_picture: "" }
               }
            ]);
        } else {
            setReels(fetchedReels);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  // Handle scroll snap events
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  };

  const nextReel = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  const prevReel = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    if (!uploadTitle.trim()) {
      alert('Please add a caption for your reel.');
      return;
    }
    setIsPublishing(true);
    try {
      // We use a mock URL for the demo as the backend does not have a blob storage endpoint yet
      const dummyUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
      const response = await api.post('/api/ecosystem/reels', {
        video_url: dummyUrl,
        caption: uploadTitle,
        tags: "Engineering,Updates"
      });
      setReels([response.data, ...reels]);
      setShowUploadModal(false);
      setUploadTitle('');
    } catch (e) {
      console.error("Failed to publish reel", e);
      alert('Failed to publish reel. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
     return (
        <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center bg-black">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
           <p className="text-white text-[10px] font-black uppercase tracking-widest">Loading Talent Reels...</p>
        </div>
     );
  }

  return (
    <div className="h-[calc(100vh-100px)] bg-black overflow-hidden relative">
      {/* Navigation Controls */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col space-y-4 hidden lg:flex">
         <button onClick={prevReel} disabled={currentIndex === 0} className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all disabled:opacity-30 disabled:hover:bg-white/10">
            <ChevronUp className="h-6 w-6" />
         </button>
         <button onClick={nextReel} disabled={currentIndex === reels.length - 1} className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all disabled:opacity-30 disabled:hover:bg-white/10">
            <ChevronDown className="h-6 w-6" />
         </button>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full max-w-lg mx-auto snap-y snap-mandatory overflow-y-scroll hide-scrollbar relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {reels.map((reel, index) => (
          <ReelCard 
             key={reel.id} 
             reel={reel} 
             isActive={index === currentIndex} 
             isMuted={isMuted} 
             setIsMuted={setIsMuted} 
          />
        ))}
      </div>

      {/* Upload FAB */}
      <div className="absolute bottom-6 right-6 lg:right-12 z-50">
        <button 
          onClick={() => setShowUploadModal(true)}
          className="p-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-white/20"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
      </div>

      {/* Upload Modal Overlay */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Upload Talent Reel</h2>
              <p className="text-xs font-medium text-white/50">Showcase your technical capability via video. Maximum 60 seconds.</p>
              
              <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Reel Caption / Context</label>
                   <textarea 
                     value={uploadTitle}
                     onChange={e => setUploadTitle(e.target.value)}
                     className="w-full h-24 bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-primary outline-none resize-none"
                     placeholder="e.g. Breaking down my recent migration to Kubernetes..."
                   />
                 </div>
                 
                 <div className="h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/50 hover:bg-white/5 hover:border-primary transition-colors cursor-pointer">
                    <Volume2 className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Select Video File (.mp4, .mov)</span>
                 </div>
              </div>

              <div className="flex space-x-4 pt-4">
                 <button 
                   onClick={() => setShowUploadModal(false)}
                   className="flex-1 py-4 bg-white/5 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handlePublish}
                   disabled={isPublishing || !uploadTitle.trim()}
                   className="flex-1 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-colors disabled:opacity-50"
                 >
                    {isPublishing ? 'Publishing...' : 'Publish'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReelCard({ reel, isActive, isMuted, setIsMuted }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full w-full snap-start relative bg-zinc-900 overflow-hidden flex items-center justify-center group">
       <video 
         ref={videoRef}
         src={reel.video_url}
         className="w-full h-full object-cover"
         loop
         playsInline
         muted={isMuted}
         onClick={togglePlay}
       />

       {/* Overlay Gradient */}
       <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

       {/* Play/Pause Indicator */}
       <AnimatePresence>
         {!isPlaying && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.5 }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-full bg-black/40 backdrop-blur-md pointer-events-none"
           >
              <Play className="h-12 w-12 text-white fill-current" />
           </motion.div>
         )}
       </AnimatePresence>

       {/* Top Header */}
       <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <div className="flex items-center space-x-2">
             <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg">
                Kaarya Reels
             </span>
             {reel.tags && (
                <span className="px-3 py-1 bg-primary/40 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-primary/50 shadow-lg">
                   {reel.tags}
                </span>
             )}
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors border border-white/10"
          >
             {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
       </div>

       {/* Bottom Info */}
       <div className="absolute bottom-6 left-6 right-20 z-10 space-y-4">
          <div className="flex items-center space-x-3">
             <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-zinc-800 overflow-hidden">
                   {reel.author?.profile_picture ? (
                      <img src={reel.author.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-white text-lg">
                         {reel.author?.full_name?.charAt(0) || 'K'}
                      </div>
                   )}
                </div>
                <button className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-black hover:scale-110 transition-transform">
                   <PlusCircle className="h-4 w-4" />
                </button>
             </div>
             <div>
                <h3 className="text-white font-bold text-lg leading-tight flex items-center shadow-black drop-shadow-md">
                   {reel.author?.full_name || 'Kaarya User'} 
                   <CheckCircle2 className="h-4 w-4 text-primary ml-1.5" />
                </h3>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest drop-shadow-md">Open to Work</p>
             </div>
          </div>
          
          <p className="text-white text-sm font-medium leading-relaxed drop-shadow-md line-clamp-3">
            {reel.caption}
          </p>

          <button className="px-5 py-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/20 flex items-center shadow-xl">
             <Briefcase className="h-4 w-4 mr-2" /> View Full Profile
          </button>
       </div>

       {/* Right Sidebar Actions */}
       <div className="absolute bottom-6 right-4 z-10 flex flex-col space-y-6 items-center">
          <div className="flex flex-col items-center space-y-1">
             <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-red-500 transition-colors border border-white/10 shadow-lg group">
                <Heart className="h-6 w-6 group-hover:fill-red-500" />
             </button>
             <span className="text-white text-[10px] font-bold drop-shadow-md">{reel.likes_count}</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
             <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-blue-500 transition-colors border border-white/10 shadow-lg">
                <MessageCircle className="h-6 w-6 fill-white/20" />
             </button>
             <span className="text-white text-[10px] font-bold drop-shadow-md">{reel.comments_count}</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
             <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-emerald-500 transition-colors border border-white/10 shadow-lg">
                <Share2 className="h-6 w-6" />
             </button>
             <span className="text-white text-[10px] font-bold drop-shadow-md">Share</span>
          </div>
       </div>
    </div>
  );
}
