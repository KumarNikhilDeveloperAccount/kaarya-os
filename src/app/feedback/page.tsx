'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Star, ArrowLeft } from 'lucide-react';

function FeedbackContent() {
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket');
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    // In a real app, send to backend here
    setSubmitted(true);
    
    // Redirect back to settings after 3 seconds
    setTimeout(() => {
      router.push('/settings');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Thank you!</h2>
        <p className="text-white/60 mb-8">Your feedback helps us continuously improve Kaarya OS.</p>
        <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Redirecting you to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
      <Link href="/settings" className="inline-flex items-center text-sm font-bold text-white/40 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-black text-white tracking-tight mb-2">Ticket Feedback</h1>
      {ticket && <p className="text-white/50 font-mono text-sm mb-8">Reference: {ticket}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-3">How was your experience?</label>
          <div className="flex justify-center space-x-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`p-2 transition-all rounded-full hover:bg-white/5 ${
                  (hoveredRating || rating) >= star ? 'text-yellow-400 scale-110' : 'text-white/20'
                }`}
              >
                <Star className={`w-8 h-8 ${ (hoveredRating || rating) >= star ? 'fill-yellow-400' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-3">Additional Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-colors resize-none"
            placeholder="Tell us what you liked or what we can improve..."
          />
        </div>

        <button
          type="submit"
          disabled={rating === 0}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-[0.98]"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030014]">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
      
      <div className="relative z-10 w-full">
        <Suspense fallback={<div className="text-center text-white/50 font-bold uppercase tracking-widest">Loading...</div>}>
          <FeedbackContent />
        </Suspense>
      </div>
    </div>
  );
}
