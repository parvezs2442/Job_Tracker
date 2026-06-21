'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';

export default function InterviewsPage() {
  return (
    <div className="py-20 text-center max-w-sm mx-auto space-y-4">
      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
        <CalendarDays size={22} />
      </div>
      <h2 className="text-lg font-bold text-zinc-100">Interviews tracking coming soon</h2>
      <p className="text-xs text-zinc-500">
        You will soon be able to log interview rounds, schedule alerts, and add detailed feedback.
      </p>
      <Link href="/jobs" className="btn-primary py-1.5 px-4 text-xs inline-block">
        Manage Applications
      </Link>
    </div>
  );
}
