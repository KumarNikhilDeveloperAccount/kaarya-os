'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

type Status = 'checking' | 'online' | 'offline';

export default function BackendStatusBanner() {
  const apiBase = useMemo(() => API_BASE_URL, []);
  const [status, setStatus] = useState<Status>('checking');
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const check = async () => {
    setStatus((s) => (s === 'offline' ? 'checking' : s));
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), 1200);
    try {
      const res = await fetch(`${apiBase}/api/health`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      setStatus(res.ok ? 'online' : 'offline');
    } catch {
      setStatus('offline');
    } finally {
      window.clearTimeout(t);
      setLastCheckedAt(Date.now());
    }
  };

  useEffect(() => {
    check();
    const id = window.setInterval(check, 15000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status !== 'offline') return null;

  return (
    <div className="w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500/90">
              Core offline
            </div>
            <div className="text-xs text-muted-foreground truncate">
              API not reachable at <span className="font-mono">{apiBase}</span>. UI will run, actions may fail.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={check}
            className="h-9 px-3 rounded-xl border border-border bg-secondary/40 hover:bg-secondary transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <a
            href="http://127.0.0.1:9999/docs"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3 rounded-xl border border-border bg-background/60 hover:bg-secondary transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            Open API
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      {lastCheckedAt ? (
        <div className="container mx-auto px-4 pb-2 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
          Last checked: {new Date(lastCheckedAt).toLocaleTimeString()}
        </div>
      ) : null}
    </div>
  );
}

