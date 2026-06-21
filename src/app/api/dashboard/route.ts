import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import db from '@/lib/db';
import { activityLogRepository } from '@/repositories/activity-log.repository';
import { JobStatus } from '@prisma/client';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch all jobs for the user
    const jobs = await db.job.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        platform: true,
        applicationDate: true,
      },
    });

    // Fetch recent activities
    const recentActivities = await activityLogRepository.findByUserId(userId, 5);

    // 1. Calculate KPI Metrics
    const totalApps = jobs.length;
    const interviewsCount = jobs.filter(j => j.status === JobStatus.INTERVIEW).length;
    const offersCount = jobs.filter(j => j.status === JobStatus.OFFER).length;
    const rejectionsCount = jobs.filter(j => j.status === JobStatus.REJECTED).length;
    
    const successRate = totalApps > 0 
      ? Math.round((offersCount / totalApps) * 100) 
      : 0;

    // 2. Status Distribution (Pie Chart Friendly)
    const statusCounts: Record<JobStatus, number> = {
      WISHLIST: 0,
      APPLIED: 0,
      OA: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };
    jobs.forEach(j => {
      if (statusCounts[j.status] !== undefined) {
        statusCounts[j.status]++;
      }
    });
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // 3. Platform Performance (Bar Chart Friendly)
    const platformCounts: Record<string, number> = {};
    jobs.forEach(j => {
      const p = j.platform ? j.platform.trim() : 'Direct';
      // Capitalize first letter
      const plat = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
      platformCounts[plat] = (platformCounts[plat] || 0) + 1;
    });
    const platformDistribution = Object.entries(platformCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Limit to top 5 platforms

    // 4. Monthly Applications Trend (Bar Chart Friendly)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts: Record<string, number> = {};
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyCounts[label] = 0;
    }

    jobs.forEach(j => {
      const date = new Date(j.applicationDate);
      const label = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
      if (monthlyCounts[label] !== undefined) {
        monthlyCounts[label]++;
      }
    });

    const monthlyTrend = Object.entries(monthlyCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      kpis: {
        totalApps,
        interviewsCount,
        offersCount,
        rejectionsCount,
        successRate,
      },
      statusDistribution,
      platformDistribution,
      monthlyTrend,
      recentActivities: recentActivities.map(act => ({
        id: act.id,
        action: act.action,
        createdAt: act.createdAt,
        job: act.job,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred fetching dashboard statistics' },
      { status: 500 }
    );
  }
}
