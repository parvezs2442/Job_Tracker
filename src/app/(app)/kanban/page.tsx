'use client';

import React from 'react';
import { Trello } from 'lucide-react';
import Link from 'next/link';

export default function KanbanPage() {
  return (
    <div className="py-20 text-center max-w-sm mx-auto space-y-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
        <Trello size={22} />
      </div>
      <h2 className="text-lg font-bold text-zinc-100">Kanban Board coming soon</h2>
      <p className="text-xs text-zinc-500">
        We are building a drag-and-drop workspace using DnD Kit to organize your applications visually.
      </p>
      <Link href="/jobs" className="btn-primary py-1.5 px-4 text-xs inline-block">
        Manage Applications
      </Link>
    </div>
  );
}
