'use client';

import { useState } from 'react';
import { Calendar, Clock, Video, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';

const MOCK_REQUESTS = [
  { id: 'REQ-001', candidate: 'Michael Chang', role: 'Full Stack Developer', date: '2026-06-02', time: '14:00 EST', status: 'Pending' },
  { id: 'REQ-002', candidate: 'Emma Watson', role: 'UX Designer', date: '2026-06-03', time: '10:30 EST', status: 'Approved' },
  { id: 'REQ-003', candidate: 'David Kim', role: 'Systems Engineer', date: '2026-06-04', time: '16:00 EST', status: 'Pending' },
];

export default function InterviewRequestsPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleAction = (id: string, action: 'Approved' | 'Declined') => {
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-primary" /> Interview Requests
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage inbound scheduling requests for candidates.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/50 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-4">Candidate & Role</th>
              <th className="px-6 py-4">Proposed Schedule</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-secondary/20 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{req.candidate}</span>
                    <span className="text-xs text-muted-foreground">{req.role}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-4 text-sm font-medium">
                    <div className="flex items-center space-x-1.5 bg-secondary px-3 py-1 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{req.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-secondary px-3 py-1 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{req.time}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                    req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  {req.status === 'Pending' ? (
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleAction(req.id, 'Approved')}
                        className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'Declined')}
                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    req.status === 'Approved' && (
                      <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase tracking-widest flex items-center ml-auto hover:bg-primary hover:text-white transition-colors">
                        <Video className="h-4 w-4 mr-2" /> Join Call
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
