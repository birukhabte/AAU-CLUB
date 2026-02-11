const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const { updateUserSchema } = require('../utils/validators');

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, role } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    studentId: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    _count: { select: { memberships: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: users,
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

// Get user by ID
const getUserById = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                studentId: true,
                phone: true,
                avatar: true,
                bio: true,
                role: true,
                isActive: true,
                createdAt: true,
                memberships: {
                    include: {
                        club: {
                            select: { id: true, name: true, logo: true, category: true },
                        },
                    },
                    where: { status: 'APPROVED' },
                },
            },
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Update user profile
const updateUser = async (req, res, next) => {
    try {
        const data = updateUserSchema.parse(req.body);

        // Users can only update their own profile unless admin
        if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('You can only update your own profile');
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                studentId: true,
                phone: true,
                avatar: true,
                bio: true,
                role: true,
                createdAt: true,
            },
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Update user role (Admin only)
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['ADMIN', 'CLUB_LEADER', 'MEMBER'].includes(role)) {
            throw ApiError.badRequest('Invalid role');
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        res.json({
            success: true,
            message: 'User role updated',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Toggle user active status (Admin only)
const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
        });

        if (!user) {
            throw ApiError.notFound('User not found');
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
            },
        });

        res.json({
            success: true,
            message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'}`,
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

// Change password
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw ApiError.badRequest('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    toggleUserStatus,
    changePassword,
};
