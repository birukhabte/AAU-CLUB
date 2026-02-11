const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

// Get user notifications
const getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, unreadOnly } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { userId: req.user.id };
        if (unreadOnly === 'true') where.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { userId: req.user.id, isRead: false },
            }),
        ]);

        res.json({
            success: true,
            data: notifications,
            unreadCount,
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

// Mark notification as read
const markAsRead = async (req, res, next) => {
    try {
        const notification = await prisma.notification.findUnique({
            where: { id: req.params.id },
        });

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        if (notification.userId !== req.user.id) {
            throw ApiError.forbidden();
        }

        await prisma.notification.update({
            where: { id: req.params.id },
            data: { isRead: true },
        });

        res.json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        next(error);
    }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        next(error);
    }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await prisma.notification.findUnique({
            where: { id: req.params.id },
        });

        if (!notification) {
            throw ApiError.notFound('Notification not found');
        }

        if (notification.userId !== req.user.id) {
            throw ApiError.forbidden();
        }

        await prisma.notification.delete({
            where: { id: req.params.id },
        });

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
