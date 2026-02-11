const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { registerSchema, loginSchema } = require('../utils/validators');

// Register
const register = async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw ApiError.conflict('Email already registered');
        }

        if (data.studentId) {
            const existingStudent = await prisma.user.findUnique({
                where: { studentId: data.studentId },
            });
            if (existingStudent) {
                throw ApiError.conflict('Student ID already registered');
            }
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                studentId: true,
                role: true,
                createdAt: true,
            },
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login
const login = async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        if (!user.isActive) {
            throw ApiError.forbidden('Account is deactivated. Contact an administrator.');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Refresh Token
const refreshTokenHandler = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw ApiError.badRequest('Refresh token is required');
        }

        const decoded = verifyRefreshToken(refreshToken);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user || user.refreshToken !== refreshToken) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Logout
const logout = async (req, res, next) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { refreshToken: null },
        });

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
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
                memberships: {
                    include: {
                        club: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                category: true,
                            },
                        },
                    },
                    where: { status: 'APPROVED' },
                },
            },
        });

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshTokenHandler,
    logout,
    getProfile,
};
