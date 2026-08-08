'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Circle, MoreVertical, Search, CheckCircle2, Phone, Video } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  timestamp: string;
  isSelf: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  
  // Use user id or fallback to a random ID for testing
  const clientId = user?.id || `user_${Math.floor(Math.random() * 1000)}`;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket backend
    const socket = new WebSocket(`ws://localhost:8000/api/chat/ws/${clientId}`);
    
    socket.onopen = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle echo confirmations separately if needed
        if (data.status === "delivered") return;
        
        const newMsg: Message = {
          id: Math.random().toString(36).substr(2, 9),
          sender_id: data.sender_id,
          message: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: data.sender_id === clientId
        };
        
        setMessages(prev => [...prev, newMsg]);
      } catch (e) {
        console.error("Error parsing message", e);
      }
    };
    
    socket.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    };
    
    ws.current = socket;
    
    return () => {
      socket.close();
    };
  }, [clientId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !ws.current) return;
    
    const payload = {
      message: inputText,
      // In a real app, target_id would be the currently selected contact
      target_id: null 
    };
    
    ws.current.send(JSON.stringify(payload));
    
    // Optimistically add to UI
    const optimisticMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender_id: clientId,
      message: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        
        <main className="flex-1 flex overflow-hidden p-6 gap-6">
          
          {/* Contacts Sidebar */}
          <div className="w-80 hidden lg:flex flex-col rounded-3xl bg-card border border-border/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border/50">
               <h2 className="text-2xl font-black mb-4">Messages</h2>
               <div className="relative">
                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <input 
                   type="text" 
                   placeholder="Search conversations..." 
                   className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                 />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {/* Mock Active Chat */}
               <div className="flex items-center space-x-4 p-3 rounded-2xl bg-primary/10 border border-primary/20 cursor-pointer">
                  <div className="relative">
                     <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                       AC
                     </div>
                     <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-card rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold truncate">Global Chat Room</h3>
                        <span className="text-xs text-primary font-medium">Now</span>
                     </div>
                     <p className="text-sm text-muted-foreground truncate">WebSocket test active...</p>
                  </div>
               </div>

               {/* Mock Inactive Chat */}
               <div className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-secondary/50 cursor-pointer transition-colors border border-transparent">
                  <div className="relative">
                     <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                       KN
                     </div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold truncate">Kumar Nikhil</h3>
                        <span className="text-xs text-muted-foreground">1d</span>
                     </div>
                     <p className="text-sm text-muted-foreground truncate">Great catching up today.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Active Chat Window */}
          <div className="flex-1 flex flex-col rounded-3xl bg-card border border-border/50 shadow-xl overflow-hidden relative">
            
            {/* Chat Header */}
            <div className="h-20 border-b border-border/50 flex items-center justify-between px-6 bg-card/80 backdrop-blur-md z-10">
               <div className="flex items-center space-x-4">
                  <div className="relative">
                     <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                       AC
                     </div>
                     {isConnected ? (
                       <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-card rounded-full" />
                     ) : (
                       <div className="absolute bottom-0 right-0 h-3 w-3 bg-red-500 border-2 border-card rounded-full" />
                     )}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Global Chat Room</h2>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {isConnected ? (
                        <><Circle className="h-2 w-2 text-green-500 fill-green-500 mr-1.5" /> Connected ({clientId})</>
                      ) : (
                        <><Circle className="h-2 w-2 text-red-500 fill-red-500 mr-1.5" /> Disconnected</>
                      )}
                    </p>
                  </div>
               </div>
               
               <div className="flex items-center space-x-2 text-muted-foreground">
                  <button className="p-2 hover:bg-secondary rounded-xl transition-colors"><Phone className="h-5 w-5" /></button>
                  <button className="p-2 hover:bg-secondary rounded-xl transition-colors"><Video className="h-5 w-5" /></button>
                  <button className="p-2 hover:bg-secondary rounded-xl transition-colors"><MoreVertical className="h-5 w-5" /></button>
               </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center text-xs text-muted-foreground font-bold tracking-widest uppercase my-4">
                Today
              </div>
              
              <div className="flex justify-start">
                 <div className="max-w-[70%] rounded-2xl rounded-tl-sm px-5 py-3 bg-secondary text-foreground">
                    <p>Welcome to Kaarya.OS Real-Time Networking. This is a live WebSocket connection.</p>
                    <span className="text-[10px] text-muted-foreground mt-2 block">System</span>
                 </div>
              </div>

              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                     <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                       msg.isSelf 
                         ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                         : 'bg-secondary text-foreground rounded-tl-sm'
                     }`}>
                        <p>{msg.message}</p>
                        <div className={`flex items-center mt-1.5 space-x-1 ${msg.isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                           <span className="text-[10px]">{msg.timestamp}</span>
                           {msg.isSelf && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-md">
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                 <input 
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   disabled={!isConnected}
                   placeholder={isConnected ? "Type a message..." : "Connecting to socket..."}
                   className="flex-1 bg-secondary/50 border border-border rounded-xl px-5 py-3.5 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                 />
                 <button 
                   type="submit" 
                   disabled={!inputText.trim() || !isConnected}
                   className="p-3.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
                 >
                   <Send className="h-5 w-5" />
                 </button>
              </form>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
