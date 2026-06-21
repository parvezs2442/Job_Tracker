import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { jobService } from '@/services/job.service';
import { jobUpdateSchema } from '@/validators/job.validator';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const job = await jobService.getJob(user.id, id);
    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Job not found' },
      { status: 404 }
    );
  }
}

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

    const parsedData = jobUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedJob = await jobService.updateJob(user.id, id, parsedData.data);
    return NextResponse.json(updatedJob);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error updating job' },
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
    const deletedJob = await jobService.deleteJob(user.id, id);
    return NextResponse.json({ message: 'Job deleted successfully', id: deletedJob.id });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error deleting job' },
      { status: 400 }
    );
  }
}
