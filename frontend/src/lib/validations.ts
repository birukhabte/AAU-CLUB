import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required 1'),
});

export const registerSchema = z
    .object({
        firstName: z.string().min(2, 'First name is required 2'),
        lastName: z.string().min(2, 'Last name is required 2'),
        studentId: z.string().optional(),
        email: z.string().email('Please enter a valid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Must contain at least one number'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
