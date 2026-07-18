import { z } from 'zod';

export const createOrderSchema = z.object({
  serviceId: z.string().min(1),
  message: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
});
