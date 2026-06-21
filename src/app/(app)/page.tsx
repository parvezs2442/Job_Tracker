'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CalendarDays, 
  Award, 
  XOctagon, 
  TrendingUp, 
  Loader2,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface KPI {
  totalApps: number;
  interviewsCount: number;
  offersCount: number;
  rejectionsCount: number;
  successRate: number;
}

interface Activity {
  id: string;
  action: string;
  createdAt: string;
  job: { title: string; company: string } | null;
}

interface ChartData {
  name: string;
  value: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [platformData, setPlatformData] = useState<ChartData[]>([]);
  const [trendData, setTrendData] = useState<ChartData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) {
          throw new Error('Failed to load dashboard metrics');
        }
        const data = await res.json();
        setKpis(data.kpis);
        setStatusData(data.statusDistribution.filter((d: ChartData) => d.value > 0));
        setPlatformData(data.platformDistribution);
        setTrendData(data.monthlyTrend);
        setActivities(data.recentActivities);
      } catch (err: any) {
        setError(err.message || 'An error occurred loading dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = {
    WISHLIST: '#71717a',    // Zinc 500
    APPLIED: '#3b82f6',     // Blue 500
    OA: '#f59e0b',          // Amber 500
    INTERVIEW: '#8b5cf6',   // Violet 500
    OFFER: '#10b981',       // Emerald 500
    REJECTED: '#ef4444',    // Red 500
  };

  const getPieCellColor = (name: string) => {
    return (COLORS as any)[name] || '#6366f1';
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-indigo-500 mb-4" />
        <span className="text-sm text-zinc-400">Loading your workspace metrics...</span>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="py-20 text-center text-red-400 max-w-md mx-auto">
        <p className="text-base font-semibold mb-2">Error Loading Dashboard</p>
        <p className="text-sm text-zinc-500 mb-4">{error || 'Could not fetch records'}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary py-1.5 px-4 text-xs">
          Retry Connection
        </button>
      </div>
    );
  }

  const kpiCards = [
    { name: 'Total Applications', value: kpis.totalApps, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/5' },
    { name: 'Interviews Scheduled', value: kpis.interviewsCount, icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-500/5' },
    { name: 'Offers Received', value: kpis.offersCount, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    { name: 'Rejections', value: kpis.rejectionsCount, icon: XOctagon, color: 'text-red-400', bg: 'bg-red-500/5' },
    { name: 'Success Rate', value: `${kpis.successRate}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/5' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time statistics on your job hunt and conversion rates.</p>
        </div>
        <Link href="/jobs" className="btn-primary py-2 px-4">
          <Plus size={16} />
          Track New Job
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#18181b] border border-zinc-800 p-5 rounded-xl flex flex-col justify-between shadow-sm min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">{card.name}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <span className="text-2xl font-bold text-zinc-50 tracking-tight mt-3">{card.value}</span>
            </div>
          );
        })}
      </div>

      {/* CHARTS CONTAINER GRID */}
      {kpis.totalApps === 0 ? (
        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-10 text-center max-w-md mx-auto">
          <Briefcase className="mx-auto text-zinc-600 mb-4" size={32} />
          <h3 className="text-base font-semibold text-zinc-300">Workspace is empty</h3>
          <p className="text-xs text-zinc-500 mt-1.5 mb-6">
            Add job applications to populate your analytics charts and monthly trends.
          </p>
          <Link href="/jobs" className="btn-primary py-2 px-4 text-xs">
            Add First Application
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Monthly Trend Chart */}
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm lg:col-span-2">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                Applications Trend (Last 6 Months)
              </h3>
              <div className="h-[260px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <XAxis dataKey="name" stroke="#52525b" tickLine={false} />
                    <YAxis stroke="#52525b" tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#a1a1aa' }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Pie Chart */}
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                Application Pipeline Split
              </h3>
              <div className="h-[260px] w-full flex flex-col justify-center text-xs">
                {statusData.length === 0 ? (
                  <span className="text-zinc-500 text-center text-xs">No status records</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getPieCellColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Platform Distribution Bar Chart */}
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm lg:col-span-3">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                Source Performance (Top Platforms)
              </h3>
              <div className="h-[240px] w-full text-xs">
                {platformData.length === 0 ? (
                  <span className="text-zinc-500 text-center block pt-20">No platform data available</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData} layout="vertical">
                      <XAxis type="number" stroke="#52525b" tickLine={false} allowDecimals={false} />
                      <YAxis dataKey="name" type="category" stroke="#52525b" tickLine={false} width={80} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} maxBarSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* LOWER GRID: RECENT ACTIVITIES */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-zinc-850 pb-4">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-indigo-400" />
                Audit Trail & Recent Activities
              </h3>
              <Link href="/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1">
                View All Jobs <ArrowRight size={12} />
              </Link>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No recent logs recorded.</p>
            ) : (
              <div className="relative border-l border-zinc-800 pl-4 ml-2 space-y-5 py-2">
                {activities.map((act) => (
                  <div key={act.id} className="relative text-xs">
                    {/* Circle marker */}
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700 ring-4 ring-[#18181b]" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-zinc-200 font-medium">{act.action}</span>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                        {new Date(act.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
