function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log error securely without exposing stack traces to the client in production
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}: ${message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    res.status(status).json({
        error: {
            message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred. Please try again later.' : message,
            status,
        }
    });
}

module.exports = errorHandler;
