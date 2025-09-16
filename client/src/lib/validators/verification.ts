import { z } from 'zod';

export const VerificationSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers')
});

export type VerificationFormData = z.infer<typeof VerificationSchema>;