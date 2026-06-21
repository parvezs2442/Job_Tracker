import { z } from 'zod';
import { JobStatus } from '@prisma/client';

export const jobCreateSchema = z.object({
  title: z.string().min(1, { message: 'Job title is required' }),
  company: z.string().min(1, { message: 'Company name is required' }),
  location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  status: z.nativeEnum(JobStatus).default(JobStatus.WISHLIST),
  notes: z.string().optional().nullable(),
  jobUrl: z.string().url({ message: 'Invalid URL format' }).or(z.literal('')).optional().nullable(),
  applicationDate: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().default(() => new Date())),
});

export const jobUpdateSchema = jobCreateSchema.partial();

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
