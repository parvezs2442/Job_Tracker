'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, Loader2, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  // Name Update States
  const [name, setName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<{ [key: string]: string[] } | string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!user) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === user.name) return;
    setNameLoading(true);
    setNameError(null);
    setNameSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update name');
      }

      setNameSuccess(true);
      // Reload page to refresh sidebar user context state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setNameError(err.message || 'Failed to save changes');
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setPassError(data.errors);
        } else {
          setPassError(data.message || 'Failed to change password');
        }
        return;
      }

      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          <User className="text-indigo-400" size={24} />
          Profile Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account details and password credentials.</p>
      </div>

      <div className="space-y-6">
        
        {/* CARD 1: USER DETAILS */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 border-b border-zinc-850 pb-3 flex items-center gap-2">
            <User size={16} className="text-zinc-450" />
            Account Details
          </h2>

          <form onSubmit={handleUpdateName} className="space-y-4">
            {nameSuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg flex gap-3 text-xs text-emerald-400 items-center">
                <CheckCircle size={16} />
                <span>Profile updated! Refreshing page...</span>
              </div>
            )}

            {nameError && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-lg flex gap-3 text-xs text-red-400 items-center">
                <AlertCircle size={16} />
                <span>{nameError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-450 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input 
                type="text" 
                required
                className="input-field max-w-md" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                disabled={nameLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-450 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email" 
                className="input-field max-w-md opacity-60 cursor-not-allowed" 
                value={user.email} 
                disabled 
              />
              <span className="text-[10px] text-zinc-550 block mt-1.5">
                Email address cannot be changed.
              </span>
            </div>

            <button 
              type="submit" 
              className="btn-primary py-2 px-4 shadow-sm"
              disabled={nameLoading || name.trim() === user.name}
            >
              {nameLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* CARD 2: CHANGE PASSWORD */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 border-b border-zinc-850 pb-3 flex items-center gap-2">
            <Lock size={16} className="text-zinc-450" />
            Security & Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {passSuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg flex gap-3 text-xs text-emerald-400 items-center">
                <CheckCircle size={16} />
                <span>Password changed successfully.</span>
              </div>
            )}

            {passError && typeof passError === 'string' && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-lg flex gap-3 text-xs text-red-400 items-center">
                <AlertCircle size={16} />
                <span>{passError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-450 mb-1.5 uppercase tracking-wider">
                Current Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                className="input-field max-w-md" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passLoading}
              />
              {passError && typeof passError === 'object' && passError.currentPassword && (
                <p className="text-[11px] text-red-400 mt-1">{passError.currentPassword[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                className="input-field max-w-md" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passLoading}
              />
              {passError && typeof passError === 'object' && passError.newPassword && (
                <p className="text-[11px] text-red-400 mt-1">{passError.newPassword[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                className="input-field max-w-md" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passLoading}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary py-2 px-4 shadow-sm"
              disabled={passLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {passLoading ? <Loader2 size={16} className="animate-spin" /> : 'Change Password'}
            </button>
          </form>
        </div>

        {/* CARD 3: LOGOUT OVERVIEW */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-300">Sign Out</h3>
            <p className="text-xs text-zinc-500 mt-0.5">End your current browser session safely.</p>
          </div>
          <button 
            onClick={logout}
            className="btn-secondary text-red-400 border-red-500/10 hover:bg-red-500/5 hover:border-red-500/20 flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
