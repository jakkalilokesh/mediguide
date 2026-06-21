const { scoreSymptoms, mergeUrgency } = require('../ml/symptomScorer');

describe('Symptom Scorer ML Engine', () => {
    test('should return Low urgency for minor symptoms', () => {
        const result = scoreSymptoms('just minor chapped lips');
        expect(result.urgency).toBe('LOW');
        expect(result.score).toBeLessThan(0.3);
    });

    test('should boost urgency to URGENT or CRITICAL for dangerous combinations', () => {
        // chest pain (0.95) + shortness of breath (combo boost: 0.3)
        const result = scoreSymptoms('I have sudden chest pain and shortness of breath');
        expect(result.urgency).toBe('CRITICAL');
        expect(result.score).toBeGreaterThanOrEqual(0.85);
        expect(result.combos).toContain('Possible cardiac event');
    });

    test('should apply severity modifiers correctly', () => {
        const moderate = scoreSymptoms('I have a headache with moderate pain');
        const excruciating = scoreSymptoms('I have a headache with excruciating pain');
        expect(excruciating.score).toBeGreaterThan(moderate.score);
    });

    test('should apply duration modifiers for chronic symptoms', () => {
        const shortDuration = scoreSymptoms('I have a cough since minutes ago');
        const chronicDuration = scoreSymptoms('I have a cough since several weeks');
        expect(chronicDuration.score).toBeGreaterThan(shortDuration.score);
    });

    test('should merge urgency levels taking the higher rank for safety', () => {
        expect(mergeUrgency('LOW', 'CRITICAL')).toBe('CRITICAL');
        expect(mergeUrgency('URGENT', 'MODERATE')).toBe('URGENT');
        expect(mergeUrgency('HIGH', 'HIGH')).toBe('HIGH');
    });
});
