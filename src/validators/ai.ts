import { z } from 'zod';

export const generateServiceSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().optional(),
  bulletPoints: z.string().optional(),
  targetAudience: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export const analyzeDocSchema = z.object({
  content: z.string().min(1).max(50000),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
});

export const trackEventSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});
