import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { interviewService } from '@/services/interview.service';
import { interviewUpdateSchema } from '@/validators/interview.validator';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const parsedData = interviewUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await interviewService.updateInterview(user.id, id, parsedData.data);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error updating interview' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await interviewService.deleteInterview(user.id, id);
    return NextResponse.json({ message: 'Interview deleted successfully', id: deleted.id });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error deleting interview' },
      { status: 400 }
    );
  }
}
