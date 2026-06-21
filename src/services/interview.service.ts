import { interviewRepository } from '@/repositories/interview.repository';
import { jobRepository } from '@/repositories/job.repository';
import { activityLogRepository } from '@/repositories/activity-log.repository';
import { notificationRepository } from '@/repositories/notification.repository';
import { InterviewCreateInput, InterviewUpdateInput } from '@/validators/interview.validator';
import { Interview, InterviewResult } from '@prisma/client';

export class InterviewService {
  async scheduleInterview(userId: string, jobId: string, input: InterviewCreateInput): Promise<Interview> {
    // 1. Verify job exists and belongs to the user
    const job = await jobRepository.findById(userId, jobId);
    if (!job) {
      throw new Error('Job not found or access denied');
    }

    // 2. Create the interview
    const interview = await interviewRepository.create(jobId, {
      round: input.round,
      type: input.type,
      scheduledDate: input.scheduledDate,
      feedback: input.feedback,
      result: input.result,
    });

    // 3. Log the activity
    await activityLogRepository.createLog(
      userId,
      `Interview Scheduled: "${interview.round}" round for "${job.title}" at ${job.company}`,
      jobId
    );

    // 4. Create database notification
    const formattedDate = new Date(interview.scheduledDate).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    await notificationRepository.createNotification(
      userId,
      'Upcoming Interview Scheduled',
      `You have a ${interview.type} (${interview.round}) interview scheduled for ${formattedDate} at ${job.company}.`,
      'REMINDER'
    );

    return interview;
  }

  async getInterview(userId: string, id: string): Promise<Interview> {
    const interview = await interviewRepository.findById(id, userId);
    if (!interview) {
      throw new Error('Interview not found or access denied');
    }
    return interview;
  }

  async updateInterview(userId: string, id: string, input: InterviewUpdateInput): Promise<Interview> {
    const existing = await interviewRepository.findById(id, userId);
    if (!existing) {
      throw new Error('Interview not found or access denied');
    }

    const updated = await interviewRepository.update(id, {
      round: input.round,
      type: input.type,
      scheduledDate: input.scheduledDate,
      feedback: input.feedback,
      result: input.result,
    });

    // Check if the result was updated to PASSED or FAILED
    if (input.result && input.result !== existing.result) {
      const resultText = input.result === InterviewResult.PASSED ? 'Passed' : 'Failed';
      
      await activityLogRepository.createLog(
        userId,
        `Interview Result Updated: ${resultText} for "${updated.round}" round at ${existing.job.company}`,
        existing.jobId
      );

      await notificationRepository.createNotification(
        userId,
        `Interview Result: ${resultText}`,
        `You have been marked as ${input.result} for your ${updated.type} (${updated.round}) interview with ${existing.job.company}.`,
        'STATUS_CHANGE'
      );
    } else {
      await activityLogRepository.createLog(
        userId,
        `Interview Updated: "${updated.round}" round for "${existing.job.title}" at ${existing.job.company}`,
        existing.jobId
      );
    }

    return updated;
  }

  async deleteInterview(userId: string, id: string): Promise<Interview> {
    const existing = await interviewRepository.findById(id, userId);
    if (!existing) {
      throw new Error('Interview not found or access denied');
    }

    await interviewRepository.delete(id);

    await activityLogRepository.createLog(
      userId,
      `Interview Cancelled: "${existing.round}" round for "${existing.job.title}" at ${existing.job.company}`,
      existing.jobId
    );

    return existing;
  }

  async getInterviews(userId: string): Promise<Interview[]> {
    return interviewRepository.findByUserId(userId);
  }

  async getUpcomingInterviews(userId: string): Promise<Interview[]> {
    return interviewRepository.findUpcoming(userId);
  }

  async getUpcoming24h(userId: string): Promise<Interview[]> {
    return interviewRepository.findUpcomingIn24Hours(userId);
  }
}

export const interviewService = new InterviewService();
