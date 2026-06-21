import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { interviewService } from '@/services/interview.service';
import { interviewCreateSchema } from '@/validators/interview.validator';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const interviews = await interviewService.getInterviews(user.id);
    return NextResponse.json(interviews);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred fetching interviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, ...interviewData } = body;

    if (!jobId) {
      return NextResponse.json({ message: 'Job ID is required' }, { status: 400 });
    }

    const parsedData = interviewCreateSchema.safeParse(interviewData);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const interview = await interviewService.scheduleInterview(user.id, jobId, parsedData.data);
    return NextResponse.json(interview, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred scheduling interview' },
      { status: 500 }
    );
  }
}
