import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService } from '@/services/user.service';
import { loginSchema } from '@/validators/auth.validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate inputs
    const parsedData = loginSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Authenticate user
    const { user, token } = await userService.login(parsedData.data);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Invalid email or password' },
      { status: 401 }
    );
  }
}
