/**
 * Image Analysis Route
 * POST /api/analyze-image — Analyze symptom image via multimodal LLM
 */

const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { callLLM, PROVIDERS } = require('../utils/llmProviders');
const { parseStructuredResponse } = require('../utils/formatter');

const router = express.Router();

// POST — Analyze image + text
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { image, message, sessionId } = req.body;

        if (!image && !message) {
            return res.status(400).json({ error: 'Please provide an image or description.' });
        }

        const systemPrompt = `You are MediGuide, a medical AI assistant analyzing a patient's symptom image.
Analyze the image carefully and provide:
1. **Visual Assessment**: What you observe in the image
2. **Possible Conditions**: List 2-4 possible conditions based on visual assessment
3. **Urgency Level**: low/medium/high/emergency
4. **Recommended Actions**: What the patient should do next
5. **When to See a Doctor**: Clear guidance on when professional help is needed

IMPORTANT: Always include a disclaimer that this is AI-based guidance, not a medical diagnosis.
Respond in valid JSON format with keys: visualAssessment, possibleConditions (array), urgencyLevel, recommendations (array), whenToSeeDoctor, disclaimer`;

        // Try providers that support vision (Google Gemini, OpenAI GPT-4o)
        const CONFIG = {
            GOOGLE: { key: process.env.GOOGLE_API_KEY, model: process.env.GOOGLE_MODEL || 'gemini-2.0-flash' },
            OPENAI: { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || 'gpt-4o-mini' },
        };

        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: image
                    ? [
                        { type: 'text', text: message || 'Please analyze this image for any health concerns.' },
                        { type: 'image_url', image_url: { url: image } },
                    ]
                    : message,
            },
        ];

        let response = null;

        // Try Google first (best multimodal), then OpenAI
        for (const [provider, conf] of Object.entries(CONFIG)) {
            if (!conf.key) continue;
            try {
                const raw = await callLLM(provider.toLowerCase(), conf.model, messages, { timeout: 45000 });
                response = parseStructuredResponse(raw);
                break;
            } catch (err) {
                console.error(`Image analysis with ${provider} failed:`, err.message);
                continue;
            }
        }

        if (!response) {
            return res.status(503).json({
                error: 'Image analysis is currently unavailable. Please configure a multimodal AI provider (Google Gemini or OpenAI GPT-4o).',
            });
        }

        res.json({ response, sessionId });
    } catch (error) {
        console.error('Image analysis error:', error.message);
        res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
    }
});

module.exports = router;
