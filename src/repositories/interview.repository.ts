import db from '@/lib/db';
import { Prisma, Interview } from '@prisma/client';

export class InterviewRepository {
  async findById(id: string, userId: string): Promise<(Interview & { job: { title: string; company: string } }) | null> {
    return db.interview.findFirst({
      where: {
        id,
        job: {
          userId,
        },
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    }) as any;
  }

  async findByUserId(userId: string): Promise<Interview[]> {
    return db.interview.findMany({
      where: {
        job: {
          userId,
        },
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });
  }

  async findUpcoming(userId: string): Promise<Interview[]> {
    const now = new Date();
    return db.interview.findMany({
      where: {
        job: {
          userId,
        },
        scheduledDate: {
          gte: now,
        },
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });
  }

  async findUpcomingIn24Hours(userId: string): Promise<Interview[]> {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return db.interview.findMany({
      where: {
        job: {
          userId,
        },
        scheduledDate: {
          gte: now,
          lte: in24Hours,
        },
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });
  }

  async create(jobId: string, data: Prisma.InterviewCreateWithoutJobInput): Promise<Interview> {
    return db.interview.create({
      data: {
        ...data,
        jobId,
      },
    });
  }

  async update(id: string, data: Prisma.InterviewUpdateInput): Promise<Interview> {
    return db.interview.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Interview> {
    return db.interview.delete({
      where: { id },
    });
  }
}

export const interviewRepository = new InterviewRepository();
