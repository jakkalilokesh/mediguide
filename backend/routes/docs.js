/**
 * Interactive API Reference Documentation v7
 * GET /api/docs — Serves a stunning premium medical UI-themed
 * interactive reference for all backend endpoints.
 */

const express = require('express');
const router = express.Router();

const API_METADATA = {
    title: 'MediGuide API Reference',
    description: 'Developer documentation for the MediGuide Platform. Authenticate via Bearer Token and use correlation IDs for requests.',
    version: '7.0.0',
    endpoints: [
        {
            path: '/api/auth/register',
            method: 'POST',
            auth: false,
            desc: 'Register a new patient account.',
            body: { email: 'patient@example.com', password: 'secure_password', name: 'John Doe' },
            response: { message: 'Registration successful', token: 'eyJhbGciOi...', user: { id: 1, email: 'patient@example.com', name: 'John Doe' } }
        },
        {
            path: '/api/auth/login',
            method: 'POST',
            auth: false,
            desc: 'Log in to an existing account and receive a JWT token.',
            body: { email: 'patient@example.com', password: 'secure_password' },
            response: { token: 'eyJhbGciOi...', user: { id: 1, email: 'patient@example.com', name: 'John Doe' } }
        },
        {
            path: '/api/start',
            method: 'POST',
            auth: false,
            desc: 'Start a new triage session and obtain a session ID.',
            body: {},
            response: { sessionId: '550e8400-e29b-41d4-a716-446655440000', message: 'Session created successfully' }
        },
        {
            path: '/api/symptom',
            method: 'POST',
            auth: true,
            desc: 'Triage patient symptoms, assess severity, and check red flags.',
            body: { sessionId: '550e8400-e29b-41d4-a716-446655440000', message: 'Chest tightness and shortness of breath' },
            response: {
                response: {
                    analysis: 'Urgent medical attention needed...',
                    severity: 'Critical',
                    urgencyScore: 92,
                    redFlags: ['chest_pain', 'breathlessness']
                },
                sessionId: '550e8400-e29b-41d4-a716-446655440000'
            }
        },
        {
            path: '/api/health',
            method: 'GET',
            auth: false,
            desc: 'Retrieve backend service status, database connectivity, and telemetry.',
            body: null,
            response: {
                status: 'ok',
                database: 'ok',
                uptime: '2h 15m 10s',
                primaryProvider: 'groq'
            }
        },
        {
            path: '/api/health-data',
            method: 'POST',
            auth: true,
            desc: 'Log a vital sign reading or activity metric.',
            body: { metric_type: 'heart_rate', value: 72, unit: 'bpm', notes: 'Resting' },
            response: { message: 'Health metric recorded!', metric: { id: 1, metric_type: 'heart_rate', value: 72, unit: 'bpm' } }
        },
        {
            path: '/api/health-data/export/csv',
            method: 'GET',
            auth: true,
            desc: 'Download all user metrics and symptom logs as a CSV file.',
            body: null,
            response: 'CSV text response stream...'
        }
    ]
};

router.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en" data-theme="dark">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${API_METADATA.title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #059669;
                --primary-dark: #047857;
                --bg: #080F0B;
                --bg-alt: #0E1A13;
                --surface: rgba(16, 32, 22, .65);
                --text: #E4F0E8;
                --text-sec: #8BBF9C;
                --border: rgba(16, 185, 129, 0.15);
                --accent: #F59E0B;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Inter', sans-serif;
                background: var(--bg);
                color: var(--text);
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { max-width: 1000px; margin: 0 auto; }
            header {
                margin-bottom: 40px;
                border-bottom: 1px solid var(--border);
                padding-bottom: 24px;
            }
            header h1 { font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
            header p { color: var(--text-sec); font-size: 1.1rem; }
            .badge {
                display: inline-block;
                padding: 4px 10px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                border-radius: 4px;
                margin-bottom: 12px;
            }
            .badge-version { background: rgba(5, 150, 105, 0.15); color: var(--primary); }
            .endpoint-card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 12px;
                margin-bottom: 24px;
                padding: 24px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .endpoint-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            }
            .method {
                display: inline-block;
                padding: 6px 12px;
                font-weight: 800;
                font-size: 0.85rem;
                border-radius: 6px;
                margin-right: 12px;
            }
            .method-post { background: rgba(245, 158, 11, 0.15); color: var(--accent); }
            .method-get { background: rgba(5, 150, 105, 0.15); color: var(--primary); }
            .path { font-family: monospace; font-size: 1.1rem; font-weight: 700; }
            .desc { margin: 12px 0; color: var(--text-sec); }
            .meta-info {
                display: flex;
                gap: 16px;
                font-size: 0.85rem;
                color: var(--text-sec);
                margin-bottom: 16px;
            }
            .meta-item { display: flex; align-items: center; gap: 6px; }
            .meta-icon { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
            .meta-auth-true { background: var(--accent); }
            .meta-auth-false { background: var(--primary); }
            pre {
                background: var(--bg-alt);
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 16px;
                font-size: 0.9rem;
                overflow-x: auto;
                font-family: monospace;
            }
            .section-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; color: var(--text-sec); }
            .code-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
            @media (min-width: 768px) {
                .code-grid { grid-template-columns: 1fr 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <span class="badge badge-version">v${API_METADATA.version}</span>
                <h1>${API_METADATA.title}</h1>
                <p>${API_METADATA.description}</p>
            </header>
            
            <div>
                ${API_METADATA.endpoints.map(ep => `
                    <div class="endpoint-card">
                        <div style="display: flex; align-items: center;">
                            <span class="method method-${ep.method.toLowerCase()}">${ep.method}</span>
                            <span class="path">${ep.path}</span>
                        </div>
                        <p class="desc">${ep.desc}</p>
                        <div class="meta-info">
                            <div class="meta-item">
                                <span class="meta-icon meta-auth-${ep.auth}"></span>
                                <span>${ep.auth ? 'Requires JWT Auth' : 'Public Endpoint'}</span>
                            </div>
                        </div>
                        <div class="code-grid">
                            ${ep.body ? `
                                <div>
                                    <div class="section-title">Request Body</div>
                                    <pre><code>${JSON.stringify(ep.body, null, 2)}</code></pre>
                                </div>
                            ` : ''}
                            <div>
                                <div class="section-title">Example Response</div>
                                <pre><code>${typeof ep.response === 'string' ? ep.response : JSON.stringify(ep.response, null, 2)}</code></pre>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

module.exports = router;
