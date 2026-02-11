const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { createClubSchema, updateClubSchema } = require('../utils/validators');

// Get all clubs
const getAllClubs = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, search, category, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = category;
        }
        if (status) {
            where.status = status;
        } else {
            where.status = 'ACTIVE';
        }

        const [clubs, total] = await Promise.all([
            prisma.club.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    leader: {
                        select: { id: true, firstName: true, lastName: true, avatar: true },
                    },
                    _count: {
                        select: {
                            memberships: { where: { status: 'APPROVED' } },
                            events: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.club.count({ where }),
        ]);

        res.json({
            success: true,
            data: clubs,
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

// Get club by ID
const getClubById = async (req, res, next) => {
    try {
        const club = await prisma.club.findUnique({
            where: { id: req.params.id },
            include: {
                leader: {
                    select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
                },
                _count: {
                    select: {
                        memberships: { where: { status: 'APPROVED' } },
                        events: true,
                    },
                },
                events: {
                    where: { date: { gte: new Date() } },
                    orderBy: { date: 'asc' },
                    take: 5,
                },
                announcements: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        author: {
                            select: { firstName: true, lastName: true },
                        },
                    },
                },
            },
        });

        if (!club) {
            throw ApiError.notFound('Club not found');
        }

        res.json({
            success: true,
            data: club,
        });
    } catch (error) {
        next(error);
    }
};

// Create club
const createClub = async (req, res, next) => {
    try {
        const data = createClubSchema.parse(req.body);

        const club = await prisma.club.create({
            data: {
                ...data,
                leaderId: req.user.id,
            },
            include: {
                leader: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        // Update creator role to CLUB_LEADER if they're a MEMBER
        if (req.user.role === 'MEMBER') {
            await prisma.user.update({
                where: { id: req.user.id },
                data: { role: 'CLUB_LEADER' },
            });
        }

        // Auto-create approved membership for the leader
        await prisma.membership.create({
            data: {
                userId: req.user.id,
                clubId: club.id,
                status: 'APPROVED',
                joinedAt: new Date(),
            },
        });

        res.status(201).json({
            success: true,
            message: 'Club created successfully',
            data: club,
        });
    } catch (error) {
        next(error);
    }
};

// Update club
const updateClub = async (req, res, next) => {
    try {
        const data = updateClubSchema.parse(req.body);

        const club = await prisma.club.update({
            where: { id: req.params.id },
            data,
            include: {
                leader: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        res.json({
            success: true,
            message: 'Club updated successfully',
            data: club,
        });
    } catch (error) {
        next(error);
    }
};

// Update club status (Admin only)
const updateClubStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
            throw ApiError.badRequest('Invalid status');
        }

        const club = await prisma.club.update({
            where: { id: req.params.id },
            data: { status },
        });

        res.json({
            success: true,
            message: `Club status updated to ${status}`,
            data: club,
        });
    } catch (error) {
        next(error);
    }
};

// Delete club (Admin only)
const deleteClub = async (req, res, next) => {
    try {
        await prisma.club.delete({
            where: { id: req.params.id },
        });

        res.json({
            success: true,
            message: 'Club deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Get club categories
const getCategories = async (req, res, next) => {
    try {
        const clubs = await prisma.club.findMany({
            select: { category: true },
            distinct: ['category'],
        });

        const categories = clubs.map((c) => c.category);

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

// Get club members
const getClubMembers = async (req, res, next) => {
    try {
        const { status } = req.query;
        const where = { clubId: req.params.id };
        if (status) {
            where.status = status;
        }

        const members = await prisma.membership.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        studentId: true,
                        phone: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: members,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllClubs,
    getClubById,
    createClub,
    updateClub,
    updateClubStatus,
    deleteClub,
    getCategories,
    getClubMembers,
};
