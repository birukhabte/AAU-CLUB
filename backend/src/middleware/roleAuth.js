const ApiError = require('../utils/ApiError');

/**
 * Middleware factory to require specific roles
 * @param {...string} roles - Allowed roles (ADMIN, CLUB_LEADER, MEMBER)
 * @returns {Function} Express middleware
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied. Required roles: ${roles.join(', ')}`));
    }

    next();
  };
}

/**
 * Middleware to require ADMIN role
 * @returns {Function} Express middleware
 */
function requireAdmin() {
  return requireRole('ADMIN');
}

/**
 * Middleware to require CLUB_LEADER or ADMIN role
 * @returns {Function} Express middleware
 */
function requireClubLeaderOrAdmin() {
  return requireRole('ADMIN', 'CLUB_LEADER');
}

/**
 * Middleware to require MEMBER role (any authenticated user)
 * @returns {Function} Express middleware
 */
function requireMember() {
  return requireRole('ADMIN', 'CLUB_LEADER', 'MEMBER');
}

module.exports = {
  requireRole,
  requireAdmin,
  requireClubLeaderOrAdmin,
  requireMember,
};
