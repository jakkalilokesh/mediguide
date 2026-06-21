const { getPromptForModule } = require('../prompts/medicalPrompt');

describe('MLOps: System Prompt Compliance and Safety Audits', () => {
    const modules = [
        'symptom',
        'firstaid',
        'medicine',
        'wellness',
        'mentalhealth',
        'nutrition',
        'chat',
        'consultation',
        'druginteraction'
    ];

    test('All module prompts must be successfully retrieved', () => {
        modules.forEach(mod => {
            const prompt = getPromptForModule(mod);
            expect(prompt).toBeDefined();
            expect(typeof prompt).toBe('string');
            expect(prompt.length).toBeGreaterThan(100);
        });
    });

    test('Triage and Consultation prompts must enforce safety rules', () => {
        const triagePrompt = getPromptForModule('symptom');
        const consultationPrompt = getPromptForModule('consultation');

        // Check negative constraints (what the model MUST NOT do)
        expect(triagePrompt).toMatch(/NEVER/);
        expect(triagePrompt).toMatch(/diagnose/);
        expect(triagePrompt).toMatch(/prescribe/);

        expect(consultationPrompt).toMatch(/NEVER/);
        expect(consultationPrompt).toMatch(/diagnose/);
        expect(consultationPrompt).toMatch(/prescribe/);
    });

    test('All prompts must mandate JSON schema compliance', () => {
        modules.forEach(mod => {
            const prompt = getPromptForModule(mod);
            // Every single module prompt should enforce return type JSON formatting
            expect(prompt.toLowerCase()).toContain('json');
        });
    });

    test('Mental Health prompt must enforce critical suicide/crisis guidelines', () => {
        const mentalHealthPrompt = getPromptForModule('mentalhealth');
        expect(mentalHealthPrompt).toMatch(/self-harm|suicide|suicidal/);
        expect(mentalHealthPrompt).toMatch(/helpline|988/);
    });
});
