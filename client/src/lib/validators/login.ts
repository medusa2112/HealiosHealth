import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional()
});

export type LoginFormData = z.infer<typeof LoginSchema>;