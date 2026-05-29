'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function ComingSoon({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="glass rounded-[2.25rem] p-10 border border-border/60">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-primary mb-8">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Module staging
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black tracking-tighter mb-4"
        >
          {title}
        </motion.h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/"
              className="h-12 px-6 rounded-2xl bg-secondary border border-border flex items-center justify-center font-black text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to core
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/settings"
              className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/15"
            >
              Tune system settings
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

