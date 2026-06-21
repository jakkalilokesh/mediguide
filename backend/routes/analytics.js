/**
 * Analytics Routes
 * GET /api/analytics/overview    — Dashboard overview
 * GET /api/analytics/modules     — Module usage stats
 * GET /api/analytics/activity    — Daily activity
 * GET /api/analytics/symptoms    — Symptom log stats
 */

const express = require('express');
const { stmts } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET — Dashboard overview
router.get('/overview', async (req, res) => {
    try {
        const moduleUsage = await stmts.getModuleUsage.all(req.userId);
        const dailyActivity = await stmts.getDailyActivity.all(req.userId);
        const symptomStats = await stmts.getSymptomStats.all(req.userId);
        const metrics = await stmts.getMetrics.all(req.userId);

        // Calculate summary
        const totalQueries = moduleUsage.reduce((sum, m) => sum + m.count, 0);
        const favoriteModule = moduleUsage[0]?.module || 'none';
        const recentMetrics = metrics.slice(0, 10);

        res.json({
            totalQueries,
            favoriteModule,
            moduleUsage,
            dailyActivity,
            symptomStats,
            recentMetrics,
        });
    } catch (error) {
        console.error('Analytics error:', error.message);
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
});

// GET — Module usage
router.get('/modules', async (req, res) => {
    try {
        const data = await stmts.getModuleUsage.all(req.userId);
        res.json({ modules: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch module stats.' });
    }
});

// GET — Daily activity
router.get('/activity', async (req, res) => {
    try {
        const data = await stmts.getDailyActivity.all(req.userId);
        res.json({ activity: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity data.' });
    }
});

// GET — Symptom stats
router.get('/symptoms', async (req, res) => {
    try {
        const logs = await stmts.getSymptomLogs.all(req.userId);
        const stats = await stmts.getSymptomStats.all(req.userId);
        res.json({ logs, stats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch symptom data.' });
    }
});

module.exports = router;
