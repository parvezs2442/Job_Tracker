import db from '@/lib/db';
import { ActivityLog } from '@prisma/client';

export class ActivityLogRepository {
  async createLog(userId: string, action: string, jobId?: string): Promise<ActivityLog> {
    return db.activityLog.create({
      data: {
        action,
        userId,
        jobId: jobId || null,
      },
    });
  }

  async findByUserId(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    return db.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });
  }
}

export const activityLogRepository = new ActivityLogRepository();
