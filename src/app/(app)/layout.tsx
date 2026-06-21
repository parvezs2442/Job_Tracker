'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { 
  LayoutDashboard, 
  Briefcase, 
  Trello, 
  CalendarDays, 
  User, 
  LogOut, 
  Loader2,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#09090b]">
        <Loader2 size={36} className="animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium text-zinc-400">Loading TrackFlow...</p>
      </div>
    );
  }

  // Fallback in case middleware latency doesn't redirect fast enough
  if (!user) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Kanban Board', href: '/kanban', icon: Trello },
    { name: 'Interviews', href: '/interviews', icon: CalendarDays },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b] relative text-zinc-100">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-[#09090b] border-r border-zinc-800/80 z-50
        flex flex-col justify-between p-5 transition-transform duration-300 md:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                T
              </div>
              <span className="font-semibold text-lg tracking-tight text-zinc-200">TrackFlow</span>
            </Link>
            <button className="md:hidden text-zinc-400 hover:text-zinc-200" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 pl-3' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'}
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-zinc-850 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-semibold text-sm text-zinc-300 border border-zinc-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-300 truncate">{user.name}</span>
              <span className="text-[10px] text-zinc-500 truncate">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER BAR */}
        <header className="sticky top-0 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/80 h-16 px-4 md:px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-zinc-400 hover:text-zinc-200" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 w-64">
              <Search size={14} className="text-zinc-500" />
              <span>Search dashboard...</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Badge */}
            <button className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#09090b]" />
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-zinc-800" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Hello,</span>
              <span className="text-xs text-zinc-200 font-semibold">{user.name}</span>
            </div>
          </div>
        </header>

        {/* SCREEN BODY */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
