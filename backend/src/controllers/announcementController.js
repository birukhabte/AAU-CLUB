const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { createAnnouncementSchema } = require('../utils/validators');

// Get announcements
const getAnnouncements = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, clubId } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (clubId) where.clubId = clubId;

        const [announcements, total] = await Promise.all([
            prisma.announcement.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    club: { select: { id: true, name: true, logo: true } },
                    author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.announcement.count({ where }),
        ]);

        res.json({
            success: true,
            data: announcements,
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

// Create announcement
const createAnnouncement = async (req, res, next) => {
    try {
        const data = createAnnouncementSchema.parse(req.body);

        const club = await prisma.club.findUnique({
            where: { id: data.clubId },
        });

        if (!club) {
            throw ApiError.notFound('Club not found');
        }

        if (club.leaderId !== req.user.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('Only club leaders can post announcements');
        }

        const announcement = await prisma.announcement.create({
            data: {
                ...data,
                authorId: req.user.id,
            },
            include: {
                club: { select: { id: true, name: true } },
                author: { select: { firstName: true, lastName: true } },
            },
        });

        // Notify all club members
        const members = await prisma.membership.findMany({
            where: { clubId: data.clubId, status: 'APPROVED' },
            select: { userId: true },
        });

        const notifications = members.map((m) => ({
            title: `Announcement: ${data.title}`,
            message: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
            type: 'announcement',
            userId: m.userId,
            link: `/clubs/${data.clubId}`,
        }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({ data: notifications });
        }

        res.status(201).json({
            success: true,
            message: 'Announcement posted',
            data: announcement,
        });
    } catch (error) {
        next(error);
    }
};

// Delete announcement
const deleteAnnouncement = async (req, res, next) => {
    try {
        const announcement = await prisma.announcement.findUnique({
            where: { id: req.params.id },
            include: { club: true },
        });

        if (!announcement) {
            throw ApiError.notFound('Announcement not found');
        }

        if (announcement.club.leaderId !== req.user.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('Only club leaders can delete announcements');
        }

        await prisma.announcement.delete({
            where: { id: req.params.id },
        });

        res.json({
            success: true,
            message: 'Announcement deleted',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
};
