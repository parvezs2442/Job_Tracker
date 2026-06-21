import { jobRepository, JobFilters } from '@/repositories/job.repository';
import { activityLogRepository } from '@/repositories/activity-log.repository';
import { JobCreateInput, JobUpdateInput } from '@/validators/job.validator';
import { Job } from '@prisma/client';

export class JobService {
  async createJob(userId: string, input: JobCreateInput): Promise<Job> {
    const job = await jobRepository.create(userId, {
      title: input.title,
      company: input.company,
      location: input.location,
      salary: input.salary,
      platform: input.platform,
      status: input.status,
      notes: input.notes,
      jobUrl: input.jobUrl,
      applicationDate: input.applicationDate,
    });

    await activityLogRepository.createLog(
      userId,
      `Job Created: "${job.title}" at ${job.company}`,
      job.id
    );

    return job;
  }

  async getJob(userId: string, jobId: string): Promise<Job> {
    const job = await jobRepository.findById(userId, jobId);
    if (!job) {
      throw new Error('Job not found or access denied');
    }
    return job;
  }

  async updateJob(userId: string, jobId: string, input: JobUpdateInput): Promise<Job> {
    // Fetch the existing job to compare fields (e.g. status)
    const existingJob = await this.getJob(userId, jobId);

    const updatedJob = await jobRepository.update(userId, jobId, {
      title: input.title,
      company: input.company,
      location: input.location,
      salary: input.salary,
      platform: input.platform,
      status: input.status,
      notes: input.notes,
      jobUrl: input.jobUrl,
      applicationDate: input.applicationDate,
    });

    // Check if status changed
    if (input.status && input.status !== existingJob.status) {
      await activityLogRepository.createLog(
        userId,
        `Status Changed to ${input.status} for "${updatedJob.title}" at ${updatedJob.company}`,
        updatedJob.id
      );
    } else {
      await activityLogRepository.createLog(
        userId,
        `Job Updated: "${updatedJob.title}" at ${updatedJob.company}`,
        updatedJob.id
      );
    }

    return updatedJob;
  }

  async deleteJob(userId: string, jobId: string): Promise<Job> {
    const job = await this.getJob(userId, jobId);
    await jobRepository.delete(userId, jobId);

    await activityLogRepository.createLog(
      userId,
      `Job Deleted: "${job.title}" at ${job.company}`
    );

    return job;
  }

  async getJobs(userId: string, filters: JobFilters): Promise<{ jobs: Job[]; total: number; page: number; limit: number }> {
    const jobs = await jobRepository.findMany(userId, filters);
    const total = await jobRepository.count(userId, filters);
    return {
      jobs,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  }
}

export const jobService = new JobService();
