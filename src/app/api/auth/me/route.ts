import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService } from '@/services/user.service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = userService.verifyToken(token);
    if (!decoded || !decoded.id) {
      // Clear invalid cookie
      cookieStore.set('token', '', { maxAge: 0, path: '/' });
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await userService.getCurrentUser(decoded.id);
    if (!user) {
      cookieStore.set('token', '', { maxAge: 0, path: '/' });
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred fetching user session' },
      { status: 500 }
    );
  }
}
