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
                throw ApiError.conflict('A record with this studentId already exists');
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

        // Save refresh token
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
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

        // Save refresh token
        // First delete any existing tokens for this user to keep it clean (optional, or allow multiple devices)
        // For now let's just create a new one, allowing multiple devices
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
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

        // Check if token exists in DB
        const savedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!savedToken || savedToken.userId !== decoded.id) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        // Check if expired (DB check in addition to JWT check)
        if (savedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { id: savedToken.id } });
            throw ApiError.unauthorized('Refresh token expired');
        }

        const user = savedToken.user;
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Rotate token
        await prisma.refreshToken.update({
            where: { id: savedToken.id },
            data: {
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
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
        const { refreshToken } = req.body;

        if (refreshToken) {
            await prisma.refreshToken.deleteMany({
                where: { token: refreshToken }, // Or delete all for user: { userId: req.user.id }
            });
        } else {
            // Fallback: delete all tokens for this user if no specific token provided 
            // (though ideally we should require the token to invalidate)
            await prisma.refreshToken.deleteMany({
                where: { userId: req.user.id },
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        // If token not found, it's already logged out effectively
        if (error.code === 'P2025') {
            return res.json({
                success: true,
                message: 'Logged out successfully',
            });
        }
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
