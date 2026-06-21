import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { userRepository } from '@/repositories/user.repository';
import { activityLogRepository } from '@/repositories/activity-log.repository';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  currentPassword: z.string().min(1, { message: 'Current password is required' }).optional().nullable(),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }).optional().nullable(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to change your password',
  path: ['currentPassword'],
});

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = profileUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, currentPassword, newPassword } = parsedData.data;
    
    // Fetch full user record to check password
    const fullUser = await userRepository.findById(user.id);
    if (!fullUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    let logs: string[] = [];

    if (name && name !== fullUser.name) {
      updateData.name = name;
      logs.push('Name changed');
    }

    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, fullUser.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Validation error', errors: { currentPassword: ['Incorrect current password'] } },
          { status: 400 }
        );
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedNewPassword;
      logs.push('Password changed');
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes provided' }, { status: 400 });
    }

    const updatedUser = await userRepository.updateUser(user.id, updateData);

    // Record activity logs
    for (const logText of logs) {
      await activityLogRepository.createLog(user.id, `Profile Settings Updated: ${logText}`);
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred updating profile' },
      { status: 500 }
    );
  }
}
