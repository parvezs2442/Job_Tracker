import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService } from '@/services/user.service';
import { registerSchema } from '@/validators/auth.validator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate inputs
    const parsedData = registerSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Register user
    const user = await userService.register(parsedData.data);
    
    // Automatically log user in by generating and setting JWT cookie
    // Fetch full user record to generate token
    const fullUser = await userService.getCurrentUser(user.id);
    if (!fullUser) {
      return NextResponse.json({ message: 'Error retrieving registered user' }, { status: 500 });
    }
    
    // Generate token
    const token = userService.generateToken({
      ...fullUser,
      password: '', // Password not needed for token generation logic in userService
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred during registration' },
      { status: 400 }
    );
  }
}
