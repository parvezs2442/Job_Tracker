import { cookies } from 'next/headers';
import { userService } from '@/services/user.service';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const decoded = userService.verifyToken(token);
    if (!decoded || !decoded.id) return null;

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}
