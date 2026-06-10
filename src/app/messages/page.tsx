'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Send, User, MessageCircle, Clock, ChevronLeft, Search, X, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function MessagesContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const threadId = searchParams.get('thread_id');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Auto-polling
    return () => clearInterval(interval);
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/api/ecosystem/messages');
      setMessages(res.data);
      
      if (threadId && !selectedUser) {
          const preSelect = res.data.find((msg: any) => 
             msg.sender.id === parseInt(threadId) || msg.receiver.id === parseInt(threadId)
          );
          if (preSelect) {
             const otherUser = preSelect.sender.id === user?.id ? preSelect.receiver : preSelect.sender;
             handleSelectUser(otherUser);
          } else {
             // Fetch user basic info if no messages exist yet
             try {
                const uRes = await api.get(`/api/auth/users/${threadId}`);
                handleSelectUser(uRes.data);
             } catch (err) {
                console.error("Failed to load thread user", err);
             }
          }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (u: any) => {
      setSelectedUser(u);
      setIsSearching(false);
      try {
          // Mark as read
          await api.patch(`/api/ecosystem/messages/${u.id}/read`);
          // Optimistically update local state
          setMessages(prev => prev.map(m => {
              if (m.sender.id === u.id && !m.is_read) {
                  return { ...m, is_read: true };
              }
              return m;
          }));
      } catch (e) {
          console.error("Failed to mark read", e);
      }
  };

  const handleSearch = async (q: string) => {
      setSearchQuery(q);
      if (q.length < 2) {
          setSearchResults([]);
          return;
      }
      try {
          const res = await api.get(`/api/auth/users/search?q=${encodeURIComponent(q)}`);
          setSearchResults(res.data);
      } catch (e) {
          console.error(e);
      }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedUser) return;
    try {
      const res = await api.post('/api/ecosystem/messages', {
        receiver_id: selectedUser.id,
        content: replyText
      });
      setMessages([res.data, ...messages]);
      setReplyText('');
    } catch (e) {
      console.error("Failed to send", e);
    }
  };

  // Group messages by conversation
  const conversations = messages.reduce((acc: any, msg) => {
    const isMe = String(msg.sender.id) === String(user?.id);
    const otherUser = isMe ? msg.receiver : msg.sender;
    if (!acc[otherUser.id]) {
      acc[otherUser.id] = { user: otherUser, messages: [], unreadCount: 0 };
    }
    acc[otherUser.id].messages.push(msg);
    if (String(msg.sender.id) === String(otherUser.id) && !msg.is_read) {
        acc[otherUser.id].unreadCount += 1;
    }
    return acc;
  }, {});

  // If selectedUser has no messages yet, ensure they appear in the chat list
  if (selectedUser && !conversations[selectedUser.id]) {
      conversations[selectedUser.id] = { user: selectedUser, messages: [], unreadCount: 0 };
  }

  const chatList = Object.values(conversations);

  if (loading) {
     return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Messages...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-100px)] flex gap-6 relative">
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearching && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-8 left-4 md:w-1/3 w-[calc(100%-2rem)] bg-card border border-border rounded-3xl shadow-2xl z-50 p-4"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black uppercase tracking-tight">New Conversation</h3>
                    <button onClick={() => setIsSearching(false)} className="p-2 hover:bg-secondary rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input 
                        type="text" 
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search network..." 
                        className="w-full bg-secondary pl-10 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                    {searchResults.map((su: any) => (
                        <button 
                            key={su.id}
                            onClick={() => handleSelectUser(su)}
                            className="w-full flex items-center space-x-3 p-3 hover:bg-secondary rounded-xl text-left transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                {su.profile_picture ? (
                                    <img src={su.profile_picture} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="font-black text-primary">{su.full_name?.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold">{su.full_name}</h4>
                                <p className="text-xs text-muted-foreground uppercase">{su.active_persona}</p>
                            </div>
                        </button>
                    ))}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-4">No users found.</p>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar List */}
      <div className={`w-full md:w-1/3 bg-card border border-border rounded-3xl p-4 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
         <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-black uppercase tracking-tight">Inbox</h1>
            </div>
            <button onClick={() => setIsSearching(true)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors">
                <Search className="w-5 h-5" />
            </button>
         </div>
         <div className="flex-1 overflow-y-auto space-y-2">
            {chatList.length === 0 ? (
               <div className="text-center p-8 text-muted-foreground/50 text-xs font-black uppercase tracking-widest">
                  No Messages Yet
               </div>
            ) : (
               chatList.map((chat: any) => (
                 <button 
                   key={chat.user.id}
                   onClick={() => handleSelectUser(chat.user)}
                   className={`w-full text-left p-4 rounded-2xl transition-all ${selectedUser?.id === chat.user.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-secondary border border-transparent'}`}
                 >
                    <div className="flex items-center space-x-3">
                       <div className="relative w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                          {chat.user.profile_picture ? (
                             <img src={chat.user.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center font-black">
                                {chat.user.full_name?.charAt(0) || 'U'}
                             </div>
                          )}
                       </div>
                       <div className="overflow-hidden flex-1">
                          <h3 className={`font-black truncate ${selectedUser?.id === chat.user.id ? 'text-white' : ''}`}>{chat.user.full_name}</h3>
                          <p className={`text-xs truncate ${selectedUser?.id === chat.user.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                             {chat.messages.length > 0 ? chat.messages[0].content : "Start a conversation"}
                          </p>
                       </div>
                       {chat.unreadCount > 0 && selectedUser?.id !== chat.user.id && (
                           <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                               {chat.unreadCount}
                           </div>
                       )}
                    </div>
                 </button>
               ))
            )}
         </div>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
         <div className="flex-1 bg-card border border-border rounded-3xl flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center">
               <button onClick={() => setSelectedUser(null)} className="md:hidden mr-4 p-2 rounded-xl bg-secondary hover:bg-muted transition-colors">
                  <ChevronLeft className="h-5 w-5" />
               </button>
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black mr-3 shrink-0">
                  {selectedUser.full_name?.charAt(0)}
               </div>
               <div>
                  <h2 className="font-black">{selectedUser.full_name}</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{selectedUser.active_persona || 'Direct Message'}</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse">
               {conversations[selectedUser.id]?.messages.map((msg: any) => {
                  const isMe = String(msg.sender.id) === String(user?.id);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                       <div className={`max-w-[70%] p-4 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-sm shadow-xl shadow-primary/20' : 'bg-secondary text-foreground rounded-bl-sm border border-border/50'}`}>
                          <p className="text-sm font-medium">{msg.content}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest mt-2 block ${isMe ? 'text-white/50 text-right' : 'text-muted-foreground'}`}>
                             {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                    </motion.div>
                  );
               })}
               {conversations[selectedUser.id]?.messages.length === 0 && (
                   <div className="text-center text-muted-foreground text-sm my-auto">
                       No messages yet. Send a message to start the conversation!
                   </div>
               )}
            </div>

            <div className="p-4 border-t border-border/50 bg-card">
               <div className="flex space-x-2">
                  <button className="p-3 bg-secondary text-muted-foreground rounded-2xl hover:bg-muted transition-colors flex items-center justify-center">
                     <span className="text-lg leading-none">😀</span>
                  </button>
                  <button className="p-3 bg-secondary text-muted-foreground font-bold text-xs rounded-2xl hover:bg-muted transition-colors flex items-center justify-center uppercase">
                     GIF
                  </button>
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Message ${selectedUser.full_name}...`}
                    className="flex-1 bg-secondary border border-transparent focus:border-primary/30 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                     <Send className="h-5 w-5" />
                  </button>
               </div>
            </div>
         </div>
      ) : (
         <div className="hidden md:flex flex-1 border border-dashed border-border rounded-3xl items-center justify-center flex-col text-center p-8 bg-secondary/10">
            <MessageCircle className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground">Select a Conversation</h3>
            <p className="text-xs text-muted-foreground/60 mt-2 max-w-sm">Connect with companies, recruiters, or candidates to advance your career.</p>
            <button onClick={() => setIsSearching(true)} className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Find Connections
            </button>
         </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
