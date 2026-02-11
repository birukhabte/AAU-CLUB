const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { createEventSchema, updateEventSchema, rsvpSchema } = require('../utils/validators');

// Get all events
const getAllEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, clubId, upcoming, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (clubId) where.clubId = clubId;
        if (upcoming === 'true') where.date = { gte: new Date() };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    club: {
                        select: { id: true, name: true, logo: true },
                    },
                    creator: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                    _count: {
                        select: { rsvps: { where: { status: 'GOING' } } },
                    },
                },
                orderBy: { date: 'asc' },
            }),
            prisma.event.count({ where }),
        ]);

        res.json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get event by ID
const getEventById = async (req, res, next) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: req.params.id },
            include: {
                club: {
                    select: { id: true, name: true, logo: true, leaderId: true },
                },
                creator: {
                    select: { id: true, firstName: true, lastName: true },
                },
                rsvps: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, avatar: true },
                        },
                    },
                },
            },
        });

        if (!event) {
            throw ApiError.notFound('Event not found');
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

// Create event
const createEvent = async (req, res, next) => {
    try {
        const data = createEventSchema.parse(req.body);

        // Verify user is club leader or admin
        const club = await prisma.club.findUnique({
            where: { id: data.clubId },
        });

        if (!club) {
            throw ApiError.notFound('Club not found');
        }

        if (club.leaderId !== req.user.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('Only club leaders can create events');
        }

        const event = await prisma.event.create({
            data: {
                ...data,
                date: new Date(data.date),
                endDate: data.endDate ? new Date(data.endDate) : null,
                creatorId: req.user.id,
            },
            include: {
                club: { select: { id: true, name: true } },
            },
        });

        // Notify all club members
        const members = await prisma.membership.findMany({
            where: { clubId: data.clubId, status: 'APPROVED' },
            select: { userId: true },
        });

        const notifications = members.map((m) => ({
            title: 'New Event',
            message: `New event "${event.title}" has been created in ${event.club.name}`,
            type: 'event_reminder',
            userId: m.userId,
            link: `/events/${event.id}`,
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications });
        }

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

// Update event
const updateEvent = async (req, res, next) => {
    try {
        const data = updateEventSchema.parse(req.body);

        const event = await prisma.event.findUnique({
            where: { id: req.params.id },
            include: { club: true },
        });

        if (!event) {
            throw ApiError.notFound('Event not found');
        }

        if (event.club.leaderId !== req.user.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('Only club leaders can update events');
        }

        const updatedEvent = await prisma.event.update({
            where: { id: req.params.id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });

        res.json({
            success: true,
            message: 'Event updated',
            data: updatedEvent,
        });
    } catch (error) {
        next(error);
    }
};

// Delete event
const deleteEvent = async (req, res, next) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: req.params.id },
            include: { club: true },
        });

        if (!event) {
            throw ApiError.notFound('Event not found');
        }

        if (event.club.leaderId !== req.user.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('Only club leaders can delete events');
        }

        await prisma.event.delete({
            where: { id: req.params.id },
        });

        res.json({
            success: true,
            message: 'Event deleted',
        });
    } catch (error) {
        next(error);
    }
};

// RSVP to an event
const rsvpEvent = async (req, res, next) => {
    try {
        const data = rsvpSchema.parse(req.body);
        const eventId = req.params.id;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw ApiError.notFound('Event not found');
        }

        // Check capacity
        if (event.capacity && data.status === 'GOING') {
            const goingCount = await prisma.rsvp.count({
                where: { eventId, status: 'GOING' },
            });
            if (goingCount >= event.capacity) {
                throw ApiError.badRequest('Event is at full capacity');
            }
        }

        const rsvp = await prisma.rsvp.upsert({
            where: {
                userId_eventId: {
                    userId: req.user.id,
                    eventId,
                },
            },
            update: { status: data.status },
            create: {
                userId: req.user.id,
                eventId,
                status: data.status,
            },
        });

        res.json({
            success: true,
            message: `RSVP updated to ${data.status}`,
            data: rsvp,
        });
    } catch (error) {
        next(error);
    }
};

// Get user's RSVPs
const getUserRSVPs = async (req, res, next) => {
    try {
        const rsvps = await prisma.rsvp.findMany({
            where: { userId: req.user.id },
            include: {
                event: {
                    include: {
                        club: { select: { id: true, name: true, logo: true } },
                    },
                },
            },
            orderBy: { event: { date: 'asc' } },
        });

        res.json({
            success: true,
            data: rsvps,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent,
    getUserRSVPs,
};
