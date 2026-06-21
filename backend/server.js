/**
 * MediGuide Backend Server v7
 * Express API with multi-model LLM, red-flag detection, SQLite database,
 * JWT auth, conversation memory, ML scoring, structured response formatting,
 * offline fallback, response caching, rate limiting, SSE streaming, and health monitoring.
 * Modules: symptom, firstaid, medicine, wellness, mentalhealth, nutrition, chat, druginteraction
 * New: auth, analytics, health-data, emergency, image-analysis, streaming
 */

const path = require('path');
const fs = require('fs');

// ─── Bulletproof .env loader ────────────────────────────────
const envPath = path.join(__dirname, '.env');
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                const key = trimmed.substring(0, eqIdx).trim();
                const val = trimmed.substring(eqIdx + 1).trim();
                process.env[key] = val;
            }
        }
    });
} catch (e) {
    console.error('Could not load .env file:', e.message);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const fse = require('fs-extra');
const rateLimit = require('express-rate-limit');

const { checkRedFlags } = require('./safety/redflags');
const { getPromptForModule } = require('./prompts/medicalPrompt');
const { parseStructuredResponse, sanitizeInput, getTimestamp } = require('./utils/formatter');
const { scoreSymptoms, mergeUrgency } = require('./ml/symptomScorer');
const { getOfflineFallback } = require('./utils/offlineFallback');
const { callLLM, PROVIDERS } = require('./utils/llmProviders');
const client = require('prom-client');

// v7 imports
const { pool, stmts } = require('./db/database');
const { optionalAuth, requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const healthDataRoutes = require('./routes/healthData');
const analyticsRoutes = require('./routes/analytics');
const emergencyRoutes = require('./routes/emergency');
const imageAnalysisRoutes = require('./routes/imageAnalysis');
const errorHandler = require('./middleware/errorHandler');
const correlationMiddleware = require('./middleware/correlation');
const compression = require('compression');
const docsRoutes = require('./routes/docs');

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (IS_PRODUCTION) {
    const originEnv = process.env.ALLOWED_ORIGIN;
    if (!originEnv || originEnv.trim() === '' || originEnv.trim() === '*') {
        console.error('❌ CRITICAL CONFIGURATION ERROR: ALLOWED_ORIGIN must be set to a specific origin or a comma-separated list of origins in production when credentials are enabled. Wildcards (*) are not allowed.');
        process.exit(1);
    }
}

const CONFIG = {
    PRIMARY: process.env.PRIMARY_PROVIDER || 'groq',
    GROQ: { key: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL },
    OPENAI: { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL },
    GOOGLE: { key: process.env.GOOGLE_API_KEY, model: process.env.GOOGLE_MODEL },
    DEEPSEEK: { key: process.env.DEEPSEEK_API_KEY, model: process.env.DEEPSEEK_MODEL },
};

// ─── Prometheus Metrics ────────────────────────────────────────
client.collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const llmCallsTotal = new client.Counter({
    name: 'mediguide_llm_calls_total',
    help: 'Total number of LLM calls by provider and status',
    labelNames: ['provider', 'module', 'status']
});

const cacheRequestsTotal = new client.Counter({
    name: 'mediguide_cache_requests_total',
    help: 'Total number of cache requests by result (hit/miss)',
    labelNames: ['module', 'result']
});

const dbPoolStatus = new client.Gauge({
    name: 'mediguide_db_pool_status',
    help: 'Database pool connection status (1 = healthy, 0 = unhealthy)',
    async collect() {
        try {
            const checkPromise = pool.query('SELECT 1');
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 2000)
            );
            await Promise.race([checkPromise, timeoutPromise]);
            this.set(1);
        } catch {
            this.set(0);
        }
    }
});

// ─── Structured Logger ─────────────────────────────────────────
const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const currentLogLevel = LOG_LEVELS.INFO;

function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > currentLogLevel) return;
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
    };
    const prefix = { ERROR: '❌', WARN: '⚠️', INFO: 'ℹ️', DEBUG: '🔍' }[level] || '•';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    console.log(`${prefix} [${entry.timestamp}] ${message}${metaStr}`);
}

// ─── Response Cache (LRU, in-memory) ───────────────────────────
class LRUCache {
    constructor(maxSize = 100, ttlMs = 30 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }
    _key(module, message) {
        return `${module}:${message.toLowerCase().trim().slice(0, 200)}`;
    }
    get(module, message) {
        const key = this._key(module, message);
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.time > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }
        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.data;
    }
    set(module, message, data) {
        const key = this._key(module, message);
        if (this.cache.size >= this.maxSize) {
            // Evict oldest entry
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
        this.cache.set(key, { data, time: Date.now() });
    }
    get stats() {
        return { size: this.cache.size, maxSize: this.maxSize };
    }
}
const responseCache = new LRUCache(100, 30 * 60 * 1000); // 100 entries, 30 min TTL

// ─── Rate Limiter (express-rate-limit) ──────────────────────────
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a moment before trying again.' },
    handler: (req, res, next, options) => {
        log('WARN', 'Rate limit exceeded', { ip: req.ip || req.connection?.remoteAddress || 'unknown' });
        res.status(options.statusCode).json(options.message);
    }
});

// ─── API Status Tracking ───────────────────────────────────────
let apiStatus = { online: true, lastCheck: null, lastError: null, requestCount: 0, failCount: 0 };
const startTime = Date.now();

// Middleware
// Metrics Duration Middleware
app.use((req, res, next) => {
    if (req.path === '/metrics') return next();

    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        httpRequestDurationMicroseconds.observe(
            { method: req.method, route: route || req.path, code: res.statusCode },
            duration
        );
    });
    next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', client.register.contentType);
        res.end(await client.register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

// Gzip/Brotli compression for all responses
app.use(compression());

// Request correlation IDs for end-to-end tracing
app.use(correlationMiddleware);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            upgradeInsecureRequests: null,
        }
    },
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: IS_PRODUCTION
        ? (process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim()))
        : ['http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Increased for image uploads

// ─── Static Files & SPA Routing ────────────────────────────────
const distPath = path.join(__dirname, '..', 'frontend', 'dist');

// Serve static assets
app.use(express.static(distPath));

// Rate limit middleware for API routes
app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next(); // Skip health check
    return apiLimiter(req, res, next);
});

// ─── v7 Route Mounts ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/health-data', healthDataRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/analyze-image', imageAnalysisRoutes);
app.use('/api/docs', docsRoutes);

// ─── Session Helpers (SQLite-backed) ──────────────────────────

async function getSession(sessionId) {
    try {
        const session = await stmts.getSession.get(sessionId);
        if (!session) return null;
        const messages = await stmts.getMessages.all(sessionId);
        return {
            id: session.id,
            messages: messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp, module: m.module })),
            createdAt: session.created_at,
            lastUpdated: session.last_updated,
            modules: JSON.parse(session.modules || '[]'),
        };
    } catch {
        return null;
    }
}

async function updateSession(sessionId, role, content, module) {
    try {
        let session = await stmts.getSession.get(sessionId);
        if (!session) {
            await stmts.createSession.run(sessionId, null);
            session = { id: sessionId, modules: '[]' };
        }
        await stmts.addMessage.run(sessionId, role, content, module || null);
        const modules = JSON.parse(session.modules || '[]');
        if (module && !modules.includes(module)) {
            modules.push(module);
        }
        await stmts.updateSessionTime.run(JSON.stringify(modules), sessionId);
        return await getSession(sessionId);
    } catch (error) {
        log('ERROR', 'Session update failed', { error: error.message });
        return null;
    }
}

// ─── Multi-Model LLM Call with Fallback ─────────────────────────

async function callLLMWithFallback(systemPrompt, conversationHistory, moduleName) {
    apiStatus.requestCount++;

    // Define the fallback order: Primary -> Others -> Offline
    const providers = [CONFIG.PRIMARY, ...Object.values(PROVIDERS).filter(p => p !== CONFIG.PRIMARY)];
    const messages = [{ role: 'system', content: systemPrompt }, ...conversationHistory];

    for (const provider of providers) {
        const conf = CONFIG[provider.toUpperCase()];
        if (!conf || !conf.key) continue;

        log('INFO', `Attempting call with provider: ${provider}`, { module: moduleName });

        try {
            const rawContent = await callLLM(provider, conf.model, messages, { timeout: 30000 });
            const parsed = parseStructuredResponse(rawContent);

            // Update API status on success
            apiStatus.online = true;
            apiStatus.lastCheck = getTimestamp();
            apiStatus.lastError = null;
            apiStatus.lastProvider = provider;

            llmCallsTotal.inc({ provider, module: moduleName, status: 'success' });

            return parsed;
        } catch (error) {
            log('WARN', `${provider} call failed`, { error: error.message });
            apiStatus.failCount++;
            apiStatus.lastError = `${provider}: ${error.message}`;
            
            llmCallsTotal.inc({ provider, module: moduleName, status: 'failure' });
            // Continue to next provider in the loop
        }
    }

    // If all providers fail, return offline fallback
    log('ERROR', 'All LLM providers failed, returning offline fallback', { module: moduleName });
    apiStatus.online = false;
    return getOfflineFallback(moduleName);
}

// ─── API Key Validation on Startup ─────────────────────────────

async function validateAPIKeys() {
    const primary = CONFIG.PRIMARY;
    const conf = CONFIG[primary.toUpperCase()];

    if (!conf || !conf.key) {
        log('WARN', `Primary provider (${primary}) not configured — will try fallbacks or offline mode`);
        apiStatus.online = false;
        return false;
    }

    log('INFO', `Primary provider set to: ${primary}`);
    // We'll skip deep validation here and rely on the first request to verify
    // but we check if at least one key exists
    const available = Object.entries(CONFIG)
        .filter(([k, v]) => k !== 'PRIMARY' && v.key)
        .map(([k]) => k);

    if (available.length === 0) {
        log('WARN', 'No LLM API keys found — app will use offline fallback responses');
        apiStatus.online = false;
        return false;
    }

    log('INFO', `Available providers: ${available.join(', ')} ✅`);
    return true;
}

// ─── Generic Module Handler ────────────────────────────────────

async function handleModuleRequest(req, res, next, moduleName, useML = false) {
    try {
        const { sessionId, message } = req.body;
        if (!sessionId || !message) {
            return res.status(400).json({ error: 'sessionId and message are required' });
        }

        const cleanMessage = sanitizeInput(message);
        log('INFO', `Request: ${moduleName}`, { sessionId: sessionId.slice(0, 8), msgLength: cleanMessage.length });

        // RED FLAG CHECK — skip for chat module (AI Clinic handles health questions via AI)
        // For other modules, extract just the user's own text (strip consultation prefixes)
        if (moduleName !== 'chat' && moduleName !== 'consultation') {
            const userTextOnly = cleanMessage.replace(/\[Specialist:.*?\]/s, '').replace(/Patient:/i, '').trim();
            const emergencyResult = checkRedFlags(userTextOnly);
            if (emergencyResult) {
                await updateSession(sessionId, 'user', cleanMessage, moduleName);
                await updateSession(sessionId, 'assistant', JSON.stringify(emergencyResult), moduleName);
                log('WARN', 'Red flag detected', { module: moduleName });
                return res.json({ response: emergencyResult, sessionId });
            }
        }

        // CHECK CACHE
        const cached = responseCache.get(moduleName, cleanMessage);
        if (cached) {
            cacheRequestsTotal.inc({ module: moduleName, result: 'hit' });
            log('INFO', 'Cache hit', { module: moduleName });
            await updateSession(sessionId, 'user', cleanMessage, moduleName);
            await updateSession(sessionId, 'assistant', JSON.stringify(cached), moduleName);
            return res.json({ response: cached, sessionId, cached: true });
        } else {
            cacheRequestsTotal.inc({ module: moduleName, result: 'miss' });
        }

        // ML SCORING (symptom module only)
        let mlResult = null;
        if (useML) {
            mlResult = scoreSymptoms(cleanMessage);
        }

        await updateSession(sessionId, 'user', cleanMessage, moduleName);
        const session = await getSession(sessionId);
        const recentMessages = (session?.messages || [])
            .filter(m => m.module === moduleName)
            .slice(-6)
            .map(m => ({ role: m.role, content: m.content }));

        const systemPrompt = getPromptForModule(moduleName);
        const response = await callLLMWithFallback(systemPrompt, recentMessages, moduleName);

        // Apply ML overlay for symptom module
        if (mlResult) {
            const finalUrgency = mergeUrgency(mlResult.urgency, response.urgencyLevel);
            response.urgencyLevel = finalUrgency;
            response.mlConfidence = mlResult.confidence;
        }

        // CACHE RESPONSE
        responseCache.set(moduleName, cleanMessage, response);

        await updateSession(sessionId, 'assistant', JSON.stringify(response), moduleName);
        res.json({ response, sessionId });
    } catch (error) {
        log('ERROR', `${moduleName} route error`, { error: error.message });
        next(error);
    }
}

// ─── API Routes ────────────────────────────────────────────────

// POST /api/start — Create a new session
app.post('/api/start', async (req, res) => {
    try {
        const sessionId = uuidv4();
        await stmts.createSession.run(sessionId, null);
        log('INFO', 'Session created', { sessionId: sessionId.slice(0, 8) });
        res.json({ sessionId, message: 'Session created successfully' });
    } catch (error) {
        log('ERROR', 'Error creating session', { error: error.message });
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Module routes
app.post('/api/symptom', (req, res, next) => handleModuleRequest(req, res, next, 'symptom', true));
app.post('/api/firstaid', (req, res, next) => handleModuleRequest(req, res, next, 'firstaid'));
app.post('/api/medicine', (req, res, next) => handleModuleRequest(req, res, next, 'medicine'));
app.post('/api/wellness', (req, res, next) => handleModuleRequest(req, res, next, 'wellness'));
app.post('/api/mentalhealth', (req, res, next) => handleModuleRequest(req, res, next, 'mentalhealth'));
app.post('/api/nutrition', (req, res, next) => handleModuleRequest(req, res, next, 'nutrition'));
app.post('/api/chat', (req, res, next) => handleModuleRequest(req, res, next, 'chat'));
app.post('/api/consultation', (req, res, next) => handleModuleRequest(req, res, next, 'consultation'));
app.post('/api/druginteraction', (req, res, next) => handleModuleRequest(req, res, next, 'druginteraction'));

// GET /api/history — List all sessions
app.get('/api/history', requireAuth, async (req, res) => {
    try {
        const allSessions = await stmts.getSessionsByUser.all(req.userId);
        const sessionList = await Promise.all(allSessions.map(async s => {
            const msgs = await stmts.getMessages.all(s.id);
            return {
                id: s.id,
                createdAt: s.created_at,
                lastUpdated: s.last_updated,
                modules: JSON.parse(s.modules || '[]'),
                messageCount: msgs.length,
                preview: msgs[0]?.content?.slice(0, 100) || 'Empty session',
            };
        }));
        res.json({ sessions: sessionList });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// GET /api/history/:id
app.get('/api/history/:id', requireAuth, async (req, res) => {
    try {
        const rawSession = await stmts.getSession.get(req.params.id);
        if (!rawSession || rawSession.user_id !== req.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const session = await getSession(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json({ session });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// DELETE /api/history/:id
app.delete('/api/history/:id', requireAuth, async (req, res) => {
    try {
        const session = await stmts.getSession.get(req.params.id);
        if (!session || session.user_id !== req.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        await stmts.deleteSession.run(req.params.id);
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// GET /api/health — Health check with detailed status
app.get('/api/health', async (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const providers = {};
    Object.keys(PROVIDERS).forEach(p => {
        const conf = CONFIG[p];
        providers[p.toLowerCase()] = {
            configured: !!(conf && conf.key),
            model: conf?.model || 'default',
        };
    });

    let dbStatus = 'ok';
    let statusCode = 200;

    try {
        const dbPromise = pool.query('SELECT 1');
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database query timed out')), 2000)
        );
        await Promise.race([dbPromise, timeoutPromise]);
    } catch (error) {
        dbStatus = 'unreachable';
        statusCode = 503;
        log('ERROR', 'Health check database query failed', { error: error.message });
    }

    res.status(statusCode).json({
        status: 'ok',
        database: dbStatus,
        service: 'MediGuide Backend v7',
        version: '7.0.0',
        timestamp: getTimestamp(),
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
        primaryProvider: CONFIG.PRIMARY,
        activeProvider: apiStatus.lastProvider || 'none',
        online: apiStatus.online,
        providers,
        stats: {
            totalRequests: apiStatus.requestCount,
            failedRequests: apiStatus.failCount,
            cacheSize: responseCache.stats.size,
            cacheMaxSize: responseCache.stats.maxSize,
        },
        modules: ['symptom', 'firstaid', 'medicine', 'wellness', 'mentalhealth', 'nutrition', 'chat', 'consultation', 'druginteraction'],
        features: ['multi-model-fallback', 'offline-fallback', 'response-cache', 'rate-limiting', 'ml-scoring', 'jwt-auth', 'sqlite-db', 'sse-streaming', 'image-analysis', 'analytics', 'health-data', 'emergency-sos', 'i18n'],
    });
});

// ─── SSE Streaming Endpoint ────────────────────────────────────

app.post('/api/stream/:module', optionalAuth, async (req, res) => {
    const moduleName = req.params.module;
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ error: 'sessionId and message are required' });
    }

    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    });

    const cleanMessage = sanitizeInput(message);

    // Red flag check — skip for chat module (AI Clinic should handle questions via AI)
    if (moduleName !== 'chat' && moduleName !== 'consultation') {
        const userTextOnly = cleanMessage.replace(/\[Specialist:.*?\]/s, '').replace(/Patient:/i, '').trim();
        const emergencyResult = checkRedFlags(userTextOnly);
        if (emergencyResult) {
            res.write(`data: ${JSON.stringify({ type: 'complete', data: emergencyResult, emergency: true })}\n\n`);
            res.end();
            return;
        }
    }

    try {
        const systemPrompt = getPromptForModule(moduleName);
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: cleanMessage },
        ];

        // Send a "start" event
        res.write(`data: ${JSON.stringify({ type: 'start', module: moduleName })}\n\n`);

        // Get the full response (simulated streaming by chunking the response text)
        const providers = [CONFIG.PRIMARY, ...Object.values(PROVIDERS).filter(p => p !== CONFIG.PRIMARY)];
        let rawContent = null;

        for (const provider of providers) {
            const conf = CONFIG[provider.toUpperCase()];
            if (!conf || !conf.key) continue;
            try {
                rawContent = await callLLM(provider, conf.model, messages, { timeout: 30000 });
                break;
            } catch { continue; }
        }

        if (!rawContent) {
            const fallback = getOfflineFallback(moduleName);
            res.write(`data: ${JSON.stringify({ type: 'complete', data: fallback })}\n\n`);
            res.end();
            return;
        }

        // Stream the raw text in chunks for typewriter effect
        const chunkSize = 12;
        for (let i = 0; i < rawContent.length; i += chunkSize) {
            const chunk = rawContent.slice(i, i + chunkSize);
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        }

        // Send final parsed response
        const parsed = parseStructuredResponse(rawContent);
        responseCache.set(moduleName, cleanMessage, parsed);
        res.write(`data: ${JSON.stringify({ type: 'complete', data: parsed })}\n\n`);
        res.end();
    } catch (error) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
    }
});

// ─── SPA Fallback ──────────────────────────────────────────────

// Anything that doesn't match an API route or a static file gets index.html
app.get('*', (req, res) => {
    // Only serve index.html if it's not an API call
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// ─── Error Handling ────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────

const server = app.listen(PORT, async () => {
    console.log(`\n🏥 MediGuide Backend v7 running on http://localhost:${PORT}`);
    console.log(`   Primary Provider: ${CONFIG.PRIMARY}`);
    console.log(`   Modules: symptom, firstaid, medicine, wellness, mentalhealth, nutrition, chat, druginteraction`);
    console.log(`   Features: multi-model, offline-fallback, cache, rate-limit, ml-scoring, jwt-auth, mysql-db, sse-streaming, image-analysis`);

    // Validate API keys on startup
    console.log(`   Validating configured providers...`);
    await validateAPIKeys();

    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

// Graceful Shutdown Handler
function gracefulShutdown(signal) {
    console.log(`\n⚠️ [${new Date().toISOString()}] Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
        console.log('HTTP server closed.');

        // Close the database pool
        try {
            await pool.end();
            console.log('Database connection pool closed.');
            process.exit(0);
        } catch (err) {
            console.error('Error closing database connection pool:', err);
            process.exit(1);
        }
    });

    // Force close after 10s if connections are hanging
    setTimeout(() => {
        console.error('Force shutting down because connections could not be closed in time.');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
