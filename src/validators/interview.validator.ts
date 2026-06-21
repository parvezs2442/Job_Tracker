import { z } from 'zod';
import { InterviewType, InterviewResult } from '@prisma/client';

export const interviewCreateSchema = z.object({
  round: z.string().min(1, { message: 'Interview round is required' }),
  type: z.nativeEnum(InterviewType),
  scheduledDate: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()),
  feedback: z.string().optional().nullable(),
  result: z.nativeEnum(InterviewResult).default(InterviewResult.PENDING),
});

export const interviewUpdateSchema = interviewCreateSchema.partial();

export type InterviewCreateInput = z.infer<typeof interviewCreateSchema>;
export type InterviewUpdateInput = z.infer<typeof interviewUpdateSchema>;
