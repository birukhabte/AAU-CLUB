const { z } = require('zod');

// Auth validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    studentId: z.string().optional(),
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Club validation schemas
const createClubSchema = z.object({
    name: z.string().min(3, 'Club name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    meetingDay: z.string().optional(),
    meetingTime: z.string().optional(),
    location: z.string().optional(),
});

const updateClubSchema = createClubSchema.partial();

// Event validation schemas
const createEventSchema = z.object({
    title: z.string().min(3, 'Event title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
    time: z.string().min(1, 'Time is required'),
    location: z.string().min(1, 'Location is required'),
    capacity: z.number().positive().optional(),
    isPublic: z.boolean().optional(),
    clubId: z.string().min(1, 'Club ID is required'),
});

const updateEventSchema = createEventSchema.partial();

// Announcement validation schemas
const createAnnouncementSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    clubId: z.string().min(1, 'Club ID is required'),
});

// Message validation schemas
const createMessageSchema = z.object({
    content: z.string().min(1, 'Message content is required'),
    receiverId: z.string().min(1, 'Receiver ID is required'),
    clubId: z.string().optional(),
});

// RSVP validation schema
const rsvpSchema = z.object({
    status: z.enum(['GOING', 'MAYBE', 'NOT_GOING']),
});

// User update schema
const updateUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    studentId: z.string().optional(),
});

module.exports = {
    registerSchema,
    loginSchema,
    createClubSchema,
    updateClubSchema,
    createEventSchema,
    updateEventSchema,
    createAnnouncementSchema,
    createMessageSchema,
    rsvpSchema,
    updateUserSchema,
};
