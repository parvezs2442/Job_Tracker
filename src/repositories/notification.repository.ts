import db from '@/lib/db';
import { Notification } from '@prisma/client';

export class NotificationRepository {
  async createNotification(userId: string, title: string, message: string, type: string): Promise<Notification> {
    return db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  async findByUserId(userId: string, limit: number = 20): Promise<Notification[]> {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return db.notification.update({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    return db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}

import { Prisma } from '@prisma/client';
export const notificationRepository = new NotificationRepository();
