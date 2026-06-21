import db from '@/lib/db';
import { Prisma, Job, JobStatus } from '@prisma/client';

export interface JobFilters {
  search?: string;
  status?: JobStatus;
  platform?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'newest' | 'oldest' | 'company';
  page?: number;
  limit?: number;
}

export class JobRepository {
  async findById(userId: string, jobId: string): Promise<Job | null> {
    return db.job.findFirst({
      where: {
        id: jobId,
        userId,
      },
    });
  }

  async create(userId: string, data: Prisma.JobCreateWithoutUserInput): Promise<Job> {
    return db.job.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(userId: string, jobId: string, data: Prisma.JobUpdateInput): Promise<Job> {
    return db.job.update({
      where: {
        id: jobId,
        userId, // Guarantees the job belongs to the user
      },
      data,
    });
  }

  async delete(userId: string, jobId: string): Promise<Job> {
    return db.job.delete({
      where: {
        id: jobId,
        userId,
      },
    });
  }

  private buildWhereClause(userId: string, filters: JobFilters): Prisma.JobWhereInput {
    const where: Prisma.JobWhereInput = { userId };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.platform) {
      where.platform = { contains: filters.platform, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      where.applicationDate = {};
      if (filters.startDate) {
        where.applicationDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.applicationDate.lte = filters.endDate;
      }
    }

    return where;
  }

  async findMany(userId: string, filters: JobFilters): Promise<Job[]> {
    const where = this.buildWhereClause(userId, filters);
    
    let orderBy: Prisma.JobOrderByWithRelationInput = { applicationDate: 'desc' };
    if (filters.sortBy) {
      if (filters.sortBy === 'oldest') {
        orderBy = { applicationDate: 'asc' };
      } else if (filters.sortBy === 'company') {
        orderBy = { company: 'asc' };
      } else if (filters.sortBy === 'newest') {
        orderBy = { applicationDate: 'desc' };
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    return db.job.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });
  }

  async count(userId: string, filters: JobFilters): Promise<number> {
    const where = this.buildWhereClause(userId, filters);
    return db.job.count({ where });
  }
}

export const jobRepository = new JobRepository();
