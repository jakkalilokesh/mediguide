const { checkRedFlags } = require('../safety/redflags');

describe('Red Flags Emergency Detection System', () => {
    test('should return emergency response for active crisis phrases', () => {
        const result = checkRedFlags('I am having a heart attack right now!');
        expect(result).not.toBeNull();
        expect(result.isEmergency).toBe(true);
        expect(result.urgencyLevel).toBe('CRITICAL');
        expect(result.detectedKeywords).toContain('having a heart attack');
    });

    test('should return null for general medical questions or descriptions', () => {
        const result = checkRedFlags('Can you tell me how to prevent a heart attack?');
        expect(result).toBeNull();
    });

    test('should return null for empty or non-string inputs', () => {
        expect(checkRedFlags('')).toBeNull();
        expect(checkRedFlags(null)).toBeNull();
        expect(checkRedFlags(undefined)).toBeNull();
    });
});
