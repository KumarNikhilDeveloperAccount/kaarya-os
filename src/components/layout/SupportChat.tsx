'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/api/support', {
        subject: "General Support Request",
        content: message
      });
      const ticketId = response.data?.id || Math.floor(Math.random() * 10000);
      toast.success("Ticket #T" + ticketId + " created! Our support team will review this shortly.");
      setMessage('');
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error: any) {
      if (error.response?.status === 401) {
         toast.error("Please log in to contact support.");
      } else {
         toast.error("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
              <div>
                <h3 className="font-bold">Kaarya Support</h3>
                <p className="text-xs opacity-80">We typically reply in a few minutes.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 flex-1 bg-secondary/20 min-h-[250px] flex flex-col justify-end space-y-4">
              <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm text-sm self-start max-w-[85%] border border-border">
                Hello! Need help with something? Describe your issue below and we'll create a support ticket for you.
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-card flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue..."
                className="flex-1 bg-secondary rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
