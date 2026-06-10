'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const res = await api.get('/api/ecosystem/reels');
      setReels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full max-w-md mx-auto bg-black relative shadow-2xl rounded-3xl mt-4 overflow-hidden">
      {/* Upload Button */}
      <button 
        onClick={() => setIsUploading(true)}
        className="absolute top-6 right-6 z-30 p-3 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll hide-scrollbar relative">
        {reels.map((reel, index) => (
          <ReelVideo key={reel.id} reel={reel} index={index} />
        ))}
        {!loading && reels.length === 0 && (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground font-bold">No Reels Available. Upload one!</div>
        )}
      </div>

      <AnimatePresence>
        {isUploading && (
          <UploadModal onClose={() => setIsUploading(false)} onUploadSuccess={() => { setIsUploading(false); fetchReels(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadModal({ onClose, onUploadSuccess }: { onClose: () => void, onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // In a real scenario, we'd upload the file first. We mock this or upload via API.
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      const videoUrl = uploadRes.data.url;
      
      await api.post('/api/ecosystem/reels', {
        video_url: videoUrl,
        caption: caption,
        tags: "#NewReel"
      });
      
      toast.success("Reel uploaded successfully!");
      onUploadSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-3xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground"><X className="h-5 w-5" /></button>
        <h3 className="text-xl font-bold mb-4">Upload Talent Reel</h3>
        
        <input type="file" accept="video/mp4,video/webm" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="w-full mb-4 p-2 border border-border rounded-xl text-sm" />
        
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a catchy caption..." className="w-full mb-4 p-3 bg-secondary rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/50 resize-none h-24" />
        
        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Publish Reel'}
        </button>
      </div>
    </motion.div>
  );
}

function ReelVideo({ reel, index }: { reel: any, index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    if (liked) return; // Prevent multiple likes for demo
    setLiked(true);
    setLikesCount(likesCount + 1);
    try {
      await api.post(`/api/ecosystem/reels/${reel.id}/like`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/reels?id=${reel.id}`);
    toast.success("Reel link copied to clipboard!");
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    setComments([{ id: Date.now(), text: commentText, author: 'You' }, ...comments]);
    setCommentText('');
    toast.success("Comment added!");
  };

  return (
    <div className="h-full w-full snap-start relative bg-secondary/20 flex items-center justify-center group overflow-hidden">
      <video
        ref={videoRef}
        src={reel.video_url}
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        className="h-full w-full object-cover cursor-pointer"
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <Play className="h-16 w-16 text-white opacity-80" fill="currentColor" />
        </div>
      )}

      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-6 left-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors z-20"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-20">
        <div className="flex flex-col items-center">
          <button 
            onClick={handleLike}
            className={`p-3 rounded-full transition-transform hover:scale-110 active:scale-90 ${liked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white'}`}
          >
            <Heart className="h-7 w-7" fill={liked ? 'currentColor' : 'none'} />
          </button>
          <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">{likesCount}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button onClick={handleComment} className="p-3 bg-black/40 rounded-full text-white hover:scale-110 transition-transform">
            <MessageCircle className="h-7 w-7" />
          </button>
          <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">0</span>
        </div>

        <div className="flex flex-col items-center">
          <button onClick={handleShare} className="p-3 bg-black/40 rounded-full text-white hover:scale-110 transition-transform">
            <Share2 className="h-7 w-7" />
          </button>
          <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">Share</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg mb-2">{reel.author?.full_name || 'Kaarya User'}</h3>
        <p className="text-white/90 text-sm font-medium mb-2">{reel.caption}</p>
        <p className="text-primary font-bold text-xs">{reel.tags}</p>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute bottom-0 left-0 right-0 h-2/3 bg-card border-t border-border rounded-t-3xl z-40 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold">Comments</h3>
              <button onClick={() => setShowComments(false)} className="p-1"><X className="h-5 w-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {comments.map((c: any) => (
                 <div key={c.id} className="text-sm border-b border-border/50 pb-2">
                   <span className="font-bold text-primary mr-2">{c.author}:</span>
                   <span>{c.text}</span>
                 </div>
               ))}
               {comments.length === 0 && <p className="text-muted-foreground text-center text-xs mt-4">No comments yet. Be the first!</p>}
            </div>
            <div className="p-4 border-t border-border flex space-x-2">
              <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} placeholder="Add a comment..." className="flex-1 bg-secondary rounded-xl px-4 py-2 outline-none text-sm text-foreground" />
              <button onClick={submitComment} className="text-primary font-bold px-4 hover:scale-105 transition-all">Post</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
