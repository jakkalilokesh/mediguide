/**
 * Response Formatter Utilities
 * Parses LLM output, sanitizes input, and formats emergency responses.
 */
const { z } = require('zod');

const GenericResponseSchema = z.object({}).catchall(z.any());


/**
 * Attempts to parse structured JSON from an LLM response.
 * LLMs sometimes wrap JSON in markdown code blocks or add extra text.
 * @param {string} rawResponse - Raw text from the LLM
 * @returns {object} Parsed response object
 */
function parseStructuredResponse(rawResponse) {
    if (!rawResponse || typeof rawResponse !== 'string') {
        return createFallbackResponse(rawResponse);
    }

    try {
        // Try direct JSON parse first
        let parsed = JSON.parse(rawResponse);
        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
            throw new Error('Parsed response is not a JSON object');
        }
        return GenericResponseSchema.parse(parsed);
    } catch (e) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = rawResponse.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            try {
                let parsed = JSON.parse(jsonMatch[1].trim());
                if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
                    return GenericResponseSchema.parse(parsed);
                }
            } catch (e2) { /* fall through */ }
        }

        // Try to find JSON object in the text
        const braceMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (braceMatch) {
            try {
                let parsed = JSON.parse(braceMatch[0]);
                if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
                    return GenericResponseSchema.parse(parsed);
                }
            } catch (e3) { /* fall through */ }
        }

        // Fallback: return as plain text
        return createFallbackResponse(rawResponse);
    }
}

/**
 * Creates a fallback response when JSON parsing fails
 */
function createFallbackResponse(text) {
    return {
        concernCategory: 'General Health Guidance',
        urgencyLevel: 'LOW',
        whatToDoNow: [typeof text === 'string' ? text : 'Unable to process response. Please try again.'],
        whenToSeeDoctor: 'Consult a healthcare professional if you have any specific health concerns or if symptoms persist.',
    };
}

/**
 * Sanitizes user input to prevent prompt injection and clean up text
 * @param {string} text - Raw user input
 * @returns {string} Cleaned text
 */
function sanitizeInput(text) {
    if (!text || typeof text !== 'string') return '';

    return text
        .trim()
        .slice(0, 2000) // Limit length
        .replace(/[<>]/g, '') // Remove HTML-like tags
        .replace(/\\/g, '') // Remove backslashes
        .replace(/\n{3,}/g, '\n\n'); // Collapse excessive newlines
}

/**
 * Formats a timestamp for display
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

module.exports = {
    parseStructuredResponse,
    createFallbackResponse,
    sanitizeInput,
    getTimestamp,
};
