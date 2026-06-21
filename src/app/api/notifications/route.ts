import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { notificationRepository } from '@/repositories/notification.repository';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await notificationRepository.findByUserId(user.id);
    const unreadCount = await notificationRepository.countUnread(user.id);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred fetching notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (id) {
      // Mark specific notification as read
      await notificationRepository.markAsRead(id, user.id);
    } else {
      // Mark all as read
      await notificationRepository.markAllAsRead(user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred updating notifications' },
      { status: 500 }
    );
  }
}
