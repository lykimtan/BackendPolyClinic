import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing',
      });
    }

    try {
      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm user từ token
      req.user = await User.findById(decoded._id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token',
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  //rest parameter
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
