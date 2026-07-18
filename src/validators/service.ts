import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(3).max(100),
  shortDesc: z.string().min(10).max(300),
  fullDesc: z.string().min(20).max(5000),
  category: z.string().min(1).max(50),
  price: z.number().positive(),
  duration: z.string().min(1).max(50),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});
