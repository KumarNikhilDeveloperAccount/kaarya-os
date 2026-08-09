'use client';

import { useState, useRef } from 'react';
import { Bot, X, Upload, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

let toggleSupportWidget: (open?: boolean) => void = () => {};
export const openSupport = () => toggleSupportWidget(true);

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bind external toggle function
  toggleSupportWidget = (open?: boolean) => {
    setIsOpen(open !== undefined ? open : !isOpen);
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64 for now
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!category || !subject || !description) return;
    setIsSubmitting(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8003';
      const res = await fetch(`${apiUrl}/api/support/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject: subject,
          content: description,
          category: category,
          sub_category: subCategory || 'General',
          screenshot_url: screenshotUrl
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReferenceNumber(data.reference_number || `TKT-${data.id}`);
      } else {
        alert(`Failed to raise ticket: ${data.detail || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while raising ticket');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed bottom-6 right-6 w-[400px] max-h-[85vh] bg-card border border-border shadow-2xl flex flex-col z-50 overflow-hidden" style={{ borderRadius: '24px' }}>
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black tracking-tight">Support Bot</h2>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Dedicated Help Desk</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-2">
               <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">Sign In Required</h3>
            <p className="text-sm text-muted-foreground mb-4">You need to be logged in to raise a support ticket so we can securely track your issue.</p>
            <Link href="/auth/login" onClick={() => setIsOpen(false)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all">
              Sign In to Continue
            </Link>
          </div>
        ) : referenceNumber ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <h3 className="text-xl font-bold">Ticket Raised Successfully!</h3>
            <div className="bg-secondary p-4 rounded-xl border border-border w-full">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Reference Number</p>
              <p className="font-mono text-lg font-black text-primary">{referenceNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground">We've sent a confirmation to your registered email address along with these details.</p>
            <button onClick={() => { setIsOpen(false); setReferenceNumber(null); }} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg mt-4">
              Close Window
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            <p className="text-sm text-muted-foreground font-medium mb-6">Hello! Please fill out the details below so we can route your ticket to the correct team.</p>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-secondary text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select Category...</option>
                <option value="Technical">Technical Issue</option>
                <option value="Billing">Billing & Payments</option>
                <option value="Account">Account Access</option>
                <option value="General">General Inquiry</option>
              </select>
            </div>

            {category && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Sub-category</label>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full p-2.5 rounded-lg border border-border bg-secondary text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select Sub-category...</option>
                  <option value="Login Issue">Login Issue</option>
                  <option value="UI Bug">UI/UX Bug</option>
                  <option value="Refund Request">Refund Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Short Description</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of the issue..." className="w-full p-2.5 rounded-lg border border-border bg-secondary text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Detailed Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Please explain the issue in detail..." rows={4} className="w-full p-2.5 rounded-lg border border-border bg-secondary text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Error Screenshot (Optional)</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                {screenshotUrl ? (
                  <img src={screenshotUrl} alt="Preview" className="max-h-24 object-contain rounded-md mb-2" />
                ) : (
                  <Upload className="w-6 h-6 mb-2 group-hover:text-primary transition-colors" />
                )}
                <span className="text-xs font-medium text-center">
                  {screenshotUrl ? 'Click to change screenshot' : 'Click to upload screenshot'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !category || !subject || !description}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              {isSubmitting ? 'Raising Ticket...' : 'Raise Ticket'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
