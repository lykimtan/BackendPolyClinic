// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.log(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = {
            message,
            statusCode: 404
        };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = {
            message,
            statusCode: 400
        };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {
            message,
            statusCode: 400
        };
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = {
            message,
            statusCode: 401
        };
    }

    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {
            message,
            statusCode: 401
        };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Async handler to wrap async functions and catch errors
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};