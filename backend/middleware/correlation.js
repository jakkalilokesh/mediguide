/**
 * Request Correlation Middleware
 * 
 * Assigns a unique X-Request-ID to every incoming request.
 * This ID is propagated through logs and returned in the response header
 * so frontend clients and support engineers can trace a specific request
 * across the entire system (Express → LLM → MySQL).
 */

const { v4: uuidv4 } = require('uuid');
const { trace, context } = require('@opentelemetry/api');

function correlationMiddleware(req, res, next) {
    // Accept a client-supplied correlation ID or generate a new one
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.requestId = requestId;

    // Echo the correlation ID back to the client
    res.setHeader('X-Request-ID', requestId);

    // Attach to the current OpenTelemetry span (if active)
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
        activeSpan.setAttribute('http.request_id', requestId);
    }

    next();
}

module.exports = correlationMiddleware;
