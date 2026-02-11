const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

// Join a club (create membership request)
const joinClub = async (req, res, next) => {
    try {
        const { clubId } = req.params;

        const club = await prisma.club.findUnique({
            where: { id: clubId },
        });

        if (!club) {
            throw ApiError.notFound('Club not found');
        }

        if (club.status !== 'ACTIVE') {
            throw ApiError.badRequest('This club is not currently accepting members');
        }

        // Check if user already has a membership
        const existingMembership = await prisma.membership.findUnique({
            where: {
                userId_clubId: {
                    userId: req.user.id,
                    clubId,
                },
            },
        });

        if (existingMembership) {
            if (existingMembership.status === 'APPROVED') {
                throw ApiError.conflict('You are already a member of this club');
            }
            if (existingMembership.status === 'PENDING') {
                throw ApiError.conflict('Your membership request is pending');
            }
            // If previously rejected, allow re-joining
            await prisma.membership.update({
                where: { id: existingMembership.id },
                data: { status: 'PENDING' },
            });

            // Notify club leader
            await prisma.notification.create({
                data: {
                    title: 'New Membership Request',
                    message: `${req.user.firstName} ${req.user.lastName} has requested to join your club "${club.name}"`,
                    type: 'membership',
                    userId: club.leaderId,
                    link: `/dashboard/clubs/${clubId}/members`,
                },
            });

            return res.json({
                success: true,
                message: 'Membership request submitted',
            });
        }

        const membership = await prisma.membership.create({
            data: {
                userId: req.user.id,
                clubId,
                status: 'PENDING',
            },
        });

        // Notify club leader
        await prisma.notification.create({
            data: {
                title: 'New Membership Request',
                message: `${req.user.firstName} ${req.user.lastName} has requested to join your club "${club.name}"`,
                type: 'membership',
                userId: club.leaderId,
                link: `/dashboard/clubs/${clubId}/members`,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Membership request submitted',
            data: membership,
        });
    } catch (error) {
        next(error);
    }
};

// Approve/Reject membership (Club leader)
const updateMembershipStatus = async (req, res, next) => {
    try {
        const { membershipId } = req.params;
        const { status } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            throw ApiError.badRequest('Status must be APPROVED or REJECTED');
        }

        const membership = await prisma.membership.findUnique({
            where: { id: membershipId },
            include: { club: true },
        });

        if (!membership) {
            throw ApiError.notFound('Membership not found');
        }

        // Check if requester is club leader or admin
        if (membership.club.leaderId !== req.user.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('Only club leaders can manage memberships');
        }

        const updatedMembership = await prisma.membership.update({
            where: { id: membershipId },
            data: {
                status,
                joinedAt: status === 'APPROVED' ? new Date() : null,
            },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });

        // Notify user
        await prisma.notification.create({
            data: {
                title: `Membership ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
                message: `Your membership request to "${membership.club.name}" has been ${status.toLowerCase()}`,
                type: 'membership',
                userId: membership.userId,
                link: `/clubs/${membership.clubId}`,
            },
        });

        res.json({
            success: true,
            message: `Membership ${status.toLowerCase()}`,
            data: updatedMembership,
        });
    } catch (error) {
        next(error);
    }
};

// Leave a club
const leaveClub = async (req, res, next) => {
    try {
        const { clubId } = req.params;

        const club = await prisma.club.findUnique({
            where: { id: clubId },
        });

        if (club && club.leaderId === req.user.id) {
            throw ApiError.badRequest('Club leaders cannot leave their own club');
        }

        await prisma.membership.delete({
            where: {
                userId_clubId: {
                    userId: req.user.id,
                    clubId,
                },
            },
        });

        res.json({
            success: true,
            message: 'You have left the club',
        });
    } catch (error) {
        next(error);
    }
};

// Remove member (Club leader)
const removeMember = async (req, res, next) => {
    try {
        const { membershipId } = req.params;

        const membership = await prisma.membership.findUnique({
            where: { id: membershipId },
            include: { club: true },
        });

        if (!membership) {
            throw ApiError.notFound('Membership not found');
        }

        if (membership.club.leaderId !== req.user.id && req.user.role !== 'ADMIN') {
            throw ApiError.forbidden('Only club leaders can remove members');
        }

        if (membership.userId === membership.club.leaderId) {
            throw ApiError.badRequest('Cannot remove the club leader');
        }

        await prisma.membership.delete({
            where: { id: membershipId },
        });

        // Notify the removed user
        await prisma.notification.create({
            data: {
                title: 'Removed from Club',
                message: `You have been removed from "${membership.club.name}"`,
                type: 'membership',
                userId: membership.userId,
            },
        });

        res.json({
            success: true,
            message: 'Member removed successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Get user's memberships
const getUserMemberships = async (req, res, next) => {
    try {
        const memberships = await prisma.membership.findMany({
            where: { userId: req.user.id },
            include: {
                club: {
                    include: {
                        leader: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                        _count: {
                            select: { memberships: { where: { status: 'APPROVED' } } },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: memberships,
        });
    } catch (error) {
        next(error);
    }
};

// Check membership status
const checkMembership = async (req, res, next) => {
    try {
        const { clubId } = req.params;

        const membership = await prisma.membership.findUnique({
            where: {
                userId_clubId: {
                    userId: req.user.id,
                    clubId,
                },
            },
        });

        res.json({
            success: true,
            data: {
                isMember: membership?.status === 'APPROVED',
                status: membership?.status || null,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    joinClub,
    updateMembershipStatus,
    leaveClub,
    removeMember,
    getUserMemberships,
    checkMembership,
};
