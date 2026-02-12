const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

/**
 * Verify that club leader owns the club
 * Admins bypass this check
 */
async function verifyClubOwnership(req, res, next) {
  try {
    // Admins bypass ownership checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const clubId = req.params.clubId || req.params.id || req.body.clubId;
    
    if (!clubId) {
      return next(ApiError.badRequest('Club ID is required'));
    }

    // For club leaders, verify they own this club
    if (req.user.role === 'CLUB_LEADER') {
      if (req.user.clubId !== clubId) {
        return next(ApiError.forbidden('You can only manage your own club'));
      }
      return next();
    }

    // Non-club-leaders and non-admins cannot access
    return next(ApiError.forbidden('Access denied'));
  } catch (error) {
    next(error);
  }
}

/**
 * Verify that club leader owns the event's club
 * Admins bypass this check
 */
async function verifyEventOwnership(req, res, next) {
  try {
    // Admins bypass ownership checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const eventId = req.params.eventId || req.params.id;
    
    if (!eventId) {
      return next(ApiError.badRequest('Event ID is required'));
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clubId: true },
    });

    if (!event) {
      return next(ApiError.notFound('Event not found'));
    }

    // For club leaders, verify the event belongs to their club
    if (req.user.role === 'CLUB_LEADER') {
      if (req.user.clubId !== event.clubId) {
        return next(ApiError.forbidden('You can only manage events from your own club'));
      }
      return next();
    }

    // Non-club-leaders and non-admins cannot access
    return next(ApiError.forbidden('Access denied'));
  } catch (error) {
    next(error);
  }
}

/**
 * Verify that user is a member of the club
 * Admins and club leaders bypass this check
 */
async function verifyMembership(req, res, next) {
  try {
    // Admins and club leaders bypass membership checks
    if (req.user.role === 'ADMIN' || req.user.role === 'CLUB_LEADER') {
      return next();
    }

    const clubId = req.params.clubId || req.body.clubId;
    
    if (!clubId) {
      return next(ApiError.badRequest('Club ID is required'));
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId: clubId,
        },
      },
    });

    if (!membership || membership.status !== 'APPROVED') {
      return next(ApiError.forbidden('You must be a member of this club'));
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Verify that user is a member of the event's club
 * Admins and club leaders bypass this check
 */
async function verifyEventMembership(req, res, next) {
  try {
    // Admins and club leaders bypass membership checks
    if (req.user.role === 'ADMIN' || req.user.role === 'CLUB_LEADER') {
      return next();
    }

    const eventId = req.params.eventId || req.params.id;
    
    if (!eventId) {
      return next(ApiError.badRequest('Event ID is required'));
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clubId: true },
    });

    if (!event) {
      return next(ApiError.notFound('Event not found'));
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId: event.clubId,
        },
      },
    });

    if (!membership || membership.status !== 'APPROVED') {
      return next(ApiError.forbidden('You must be a member of the club to access this event'));
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  verifyClubOwnership,
  verifyEventOwnership,
  verifyMembership,
  verifyEventMembership,
};
