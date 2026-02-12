const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRY = '15m';
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate access token with user role and clubId
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role (ADMIN, CLUB_LEADER, MEMBER)
 * @param {string} clubId - Club ID (for CLUB_LEADER role)
 * @returns {string} JWT access token
 */
function generateAccessToken(userId, email, role, clubId = null) {
  const payload = {
    userId,
    email,
    role,
    ...(clubId && { clubId }),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {Promise<string>} JWT refresh token
 */
async function generateRefreshToken(userId) {
  const payload = {
    userId,
  };

  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify and decode access token
 * @param {string} token - JWT access token
 * @returns {object|null} Decoded token payload or null if invalid
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify and decode refresh token
 * @param {string} token - JWT refresh token
 * @returns {Promise<object|null>} Decoded token payload or null if invalid
 */
async function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    
    // Check if token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Invalidate refresh token (for logout)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function invalidateRefreshToken(userId) {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

/**
 * Invalidate specific refresh token
 * @param {string} token - Refresh token to invalidate
 * @returns {Promise<void>}
 */
async function invalidateSpecificToken(token) {
  await prisma.refreshToken.delete({
    where: { token },
  }).catch(() => {
    // Token might not exist, ignore error
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  invalidateRefreshToken,
  invalidateSpecificToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
