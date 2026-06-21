'use client';

import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Profile Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account details and credentials.</p>
      </div>

      <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-zinc-850 pb-5">
          <div className="w-16 h-16 rounded-full bg-zinc-850 flex items-center justify-center font-bold text-xl text-zinc-300 border border-zinc-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-200">{user.name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wide">Full Name</label>
            <input type="text" className="input-field max-w-md" value={user.name} disabled />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wide">Email Address</label>
            <input type="email" className="input-field max-w-md" value={user.email} disabled />
          </div>
        </div>

        <div className="border-t border-zinc-850 pt-5 flex justify-end">
          <button 
            onClick={logout}
            className="btn-secondary text-red-400 border-red-500/15 hover:bg-red-500/5 hover:border-red-500/30 flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out of TrackFlow
          </button>
        </div>
      </div>
    </div>
  );
}
