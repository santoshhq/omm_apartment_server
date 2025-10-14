const { verifyToken, extractToken } = require('../utils/jwt.utils');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = verifyToken(token);

    // Add user info to request object
    req.user = decoded;
    next();

  } catch (error) {
    console.error('JWT Authentication Error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to authenticate admin users only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = verifyToken(token);

    // Check if user is admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Add user info to request object
    req.user = decoded;
    next();

  } catch (error) {
    console.error('Admin Authentication Error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to authenticate member users only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateMember = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = verifyToken(token);

    // Check if user is member
    if (decoded.type !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Member access required'
      });
    }

    // Add user info to request object
    req.user = decoded;
    next();

  } catch (error) {
    console.error('Member Authentication Error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  authenticateMember
};