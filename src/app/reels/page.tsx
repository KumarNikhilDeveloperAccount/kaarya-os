'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchReels();
  }, []);

  if (loading) return <div className="h-screen w-full flex items-center justify-center text-primary animate-pulse">Loading Reels...</div>;

  return (
    <div className="h-[calc(100vh-80px)] w-full max-w-md mx-auto bg-black relative snap-y snap-mandatory overflow-y-scroll hide-scrollbar shadow-2xl rounded-3xl mt-4">
      {reels.map((reel, index) => (
        <ReelVideo key={reel.id} reel={reel} index={index} />
      ))}
    </div>
  );
}

function ReelVideo({ reel, index }: { reel: any, index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);

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
      
      {/* Overlay Play Button */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <Play className="h-16 w-16 text-white opacity-80" fill="currentColor" />
        </div>
      )}

      {/* Mute toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-6 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors z-20"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-20">
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setLiked(!liked)}
            className={`p-3 rounded-full transition-transform hover:scale-110 active:scale-90 ${liked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white'}`}
          >
            <Heart className="h-7 w-7" fill={liked ? 'currentColor' : 'none'} />
          </button>
          <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">{liked ? reel.likes_count + 1 : reel.likes_count}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button className="p-3 bg-black/40 rounded-full text-white hover:scale-110 transition-transform">
            <MessageCircle className="h-7 w-7" />
          </button>
          <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">0</span>
        </div>

        <div className="flex flex-col items-center">
          <button className="p-3 bg-black/40 rounded-full text-white hover:scale-110 transition-transform">
            <Share2 className="h-7 w-7" />
          </button>
          <span className="text-white text-xs font-bold mt-1 shadow-black drop-shadow-md">Share</span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none">
        <h3 className="text-white font-bold text-lg mb-2">{reel.author?.full_name || 'Kaarya User'}</h3>
        <p className="text-white/90 text-sm font-medium mb-2">{reel.caption}</p>
        <p className="text-primary font-bold text-xs">{reel.tags}</p>
      </div>
    </div>
  );
}
