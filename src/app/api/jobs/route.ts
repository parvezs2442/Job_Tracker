import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { jobService } from '@/services/job.service';
import { jobCreateSchema } from '@/validators/job.validator';
import { JobStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const search = searchParams.get('search') || undefined;
    const statusParam = searchParams.get('status');
    const status = statusParam && Object.values(JobStatus).includes(statusParam as JobStatus) 
      ? (statusParam as JobStatus) 
      : undefined;
    const platform = searchParams.get('platform') || undefined;
    
    const startDateParam = searchParams.get('startDate');
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDateParam = searchParams.get('endDate');
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const sortByParam = searchParams.get('sortBy');
    const sortBy = (sortByParam === 'oldest' || sortByParam === 'company' || sortByParam === 'newest')
      ? sortByParam
      : 'newest';

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await jobService.getJobs(user.id, {
      search,
      status,
      platform,
      startDate,
      endDate,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred fetching jobs' },
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
    const parsedData = jobCreateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const job = await jobService.createJob(user.id, parsedData.data);
    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'An error occurred creating job' },
      { status: 500 }
    );
  }
}
