const fetch = require('node-fetch');

/**
 * Multi-Model Provider Utility
 * Handles requests to OpenAI, Google Gemini, Deepseek, and Groq.
 */

const PROVIDERS = {
    GROQ: 'groq',
    OPENAI: 'openai',
    GOOGLE: 'google',
    DEEPSEEK: 'deepseek'
};

async function callLLM(provider, model, messages, options = {}) {
    const timeout = options.timeout || 30000;

    switch (provider.toLowerCase()) {
        case PROVIDERS.OPENAI:
            return callOpenAI(model, messages, timeout);
        case PROVIDERS.GOOGLE:
            return callGoogle(model, messages, timeout);
        case PROVIDERS.DEEPSEEK:
            return callDeepseek(model, messages, timeout);
        case PROVIDERS.GROQ:
        default:
            return callGroq(model, messages, timeout);
    }
}

async function callGroq(model, messages, timeout) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API Key missing');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.3,
                max_tokens: 4096,
                response_format: { type: 'json_object' }
            }),
            signal: controller.signal
        });
        clearTimeout(timer);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

async function callOpenAI(model, messages, timeout) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API Key missing');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages,
                temperature: 0.2,
                response_format: { type: 'json_object' }
            }),
            signal: controller.signal
        });
        clearTimeout(timer);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`OpenAI API Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

async function callGoogle(model, messages, timeout) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Google API Key missing');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        // Simple conversion of OpenAI-style messages to Gemini format
        const lastMsg = messages[messages.length - 1].content;
        const systemMsg = messages.find(m => m.role === 'system')?.content || '';

        const geminiModel = model || 'gemini-1.5-pro';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemMsg}\n\nUser: ${lastMsg}` }] }],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                }
            }),
            signal: controller.signal
        });
        clearTimeout(timer);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Google AI Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

async function callDeepseek(model, messages, timeout) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error('Deepseek API Key missing');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'deepseek-chat',
                messages,
                temperature: 0.2,
                response_format: { type: 'json_object' }
            }),
            signal: controller.signal
        });
        clearTimeout(timer);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Deepseek API Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

module.exports = { callLLM, PROVIDERS };
