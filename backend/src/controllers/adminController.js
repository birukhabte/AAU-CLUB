const prisma = require('../config/database');

// Get admin dashboard stats
const getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalClubs,
            activeClubs,
            totalEvents,
            upcomingEvents,
            totalMemberships,
            pendingMemberships,
            recentUsers,
            recentClubs,
            clubsByCategory,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.club.count(),
            prisma.club.count({ where: { status: 'ACTIVE' } }),
            prisma.event.count(),
            prisma.event.count({ where: { date: { gte: new Date() } } }),
            prisma.membership.count({ where: { status: 'APPROVED' } }),
            prisma.membership.count({ where: { status: 'PENDING' } }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            }),
            prisma.club.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    status: true,
                    createdAt: true,
                    _count: { select: { memberships: { where: { status: 'APPROVED' } } } },
                },
            }),
            prisma.club.groupBy({
                by: ['category'],
                _count: { id: true },
                where: { status: 'ACTIVE' },
            }),
        ]);

        // Get monthly registration stats (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyUsers = await prisma.user.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true },
        });

        const monthlyStats = {};
        monthlyUsers.forEach((user) => {
            const month = user.createdAt.toISOString().substring(0, 7);
            monthlyStats[month] = (monthlyStats[month] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalClubs,
                    activeClubs,
                    totalEvents,
                    upcomingEvents,
                    totalMemberships,
                    pendingMemberships,
                },
                recentUsers,
                recentClubs,
                clubsByCategory: clubsByCategory.map((c) => ({
                    category: c.category,
                    count: c._count.id,
                })),
                monthlyRegistrations: monthlyStats,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get activity log
const getActivityLog = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { firstName: true, lastName: true },
                    },
                },
            }),
            prisma.notification.count(),
        ]);

        res.json({
            success: true,
            data: notifications,
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

module.exports = {
    getDashboardStats,
    getActivityLog,
};
