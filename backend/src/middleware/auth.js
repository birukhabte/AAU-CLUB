const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('Access token is required');
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                clubId: true,
                isActive: true,
                avatar: true,
            },
        });

        if (!user) {
            throw ApiError.unauthorized('User not found');
        }

        if (!user.isActive) {
            throw ApiError.forbidden('Account is deactivated');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(ApiError.unauthorized('Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Token expired'));
        }
        next(error);
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized());
        }
        if (!roles.includes(req.user.role)) {
            return next(ApiError.forbidden('You do not have permission to perform this action'));
        }
        next();
    };
};

const isClubLeader = async (req, res, next) => {
    try {
        const clubId = req.params.clubId || req.body.clubId;
        if (!clubId) {
            return next(ApiError.badRequest('Club ID is required'));
        }

        if (req.user.role === 'ADMIN') {
            return next();
        }

        const club = await prisma.club.findUnique({
            where: { id: clubId },
        });

        if (!club) {
            return next(ApiError.notFound('Club not found'));
        }

        if (club.leaderId !== req.user.id) {
            return next(ApiError.forbidden('You are not the leader of this club'));
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { authenticate, authorize, isClubLeader };
