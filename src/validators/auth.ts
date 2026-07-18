import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['buyer', 'mentor', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleLoginSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  googleId: z.string().min(1),
  avatar: z.string().optional(),
});
