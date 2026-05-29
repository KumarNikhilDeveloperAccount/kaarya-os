'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, GraduationCap, Building, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockNotifications = [
  { id: 1, title: 'New Interview Request', message: 'Google has invited you to a technical session.', persona: 'candidate', time: '2m ago' },
  { id: 2, title: 'Hiring Update', message: 'You have 3 new candidate applications for "Senior Dev".', persona: 'company', time: '1h ago' },
  { id: 3, title: 'Feedback Needed', message: 'Please grade John Doe\'s simulation performance.', persona: 'trainer', time: '5h ago' },
];

const personaIcons: any = {
  candidate: { icon: GraduationCap, color: 'text-blue-500 bg-blue-500/10' },
  company: { icon: Building, color: 'text-emerald-500 bg-emerald-500/10' },
  trainer: { icon: Briefcase, color: 'text-amber-500 bg-amber-500/10' },
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all duration-300 relative group"
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-swing group-hover:animate-none' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background border border-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-bold text-sm">Unified Notifications</h3>
                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">
                  {unreadCount} New
                </span>
              </div>
              
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const PersonaIcon = personaIcons[notif.persona]?.icon || Bell;
                    const personaStyle = personaIcons[notif.persona]?.color || '';
                    return (
                      <div key={notif.id} className="p-4 border-b border-border/50 hover:bg-muted/30 transition-colors relative group">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${personaStyle}`}>
                            <PersonaIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate pr-6">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium">{notif.time}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
                      <Check className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                  </div>
                )}
              </div>
              
              <button className="w-full p-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-border">
                View All Notifications
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
