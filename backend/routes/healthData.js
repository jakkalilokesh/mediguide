/**
 * Health Data Routes (Wearable-style manual entry)
 * POST /api/health-data       — Add metric
 * GET  /api/health-data        — Get all metrics
 * GET  /api/health-data/:type  — Get by type
 * DELETE /api/health-data/:id  — Delete metric
 */

const express = require('express');
const { stmts } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(requireAuth);

// POST — Add health metric
router.post('/', async (req, res) => {
    try {
        const { metric_type, value, unit, notes, recorded_at } = req.body;

        if (!metric_type || value === undefined) {
            return res.status(400).json({ error: 'metric_type and value are required.' });
        }

        const validTypes = ['heart_rate', 'blood_pressure_sys', 'blood_pressure_dia', 'weight', 'height', 'steps', 'sleep_hours', 'water_intake', 'calories', 'blood_sugar', 'temperature', 'oxygen_saturation'];
        if (!validTypes.includes(metric_type)) {
            return res.status(400).json({ error: `Invalid metric type. Valid: ${validTypes.join(', ')}` });
        }

        const result = await stmts.addMetric.run(
            req.userId,
            metric_type,
            Number(value),
            unit || getDefaultUnit(metric_type),
            notes || null,
            recorded_at || new Date().toISOString()
        );

        res.status(201).json({
            message: 'Health metric recorded!',
            metric: { id: result.lastInsertRowid, metric_type, value: Number(value), unit: unit || getDefaultUnit(metric_type) },
        });
    } catch (error) {
        console.error('Add metric error:', error.message);
        res.status(500).json({ error: 'Failed to record metric.' });
    }
});

// GET — All metrics
router.get('/', async (req, res) => {
    try {
        const metrics = await stmts.getMetrics.all(req.userId);
        res.json({ metrics });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics.' });
    }
});

// GET — By type
router.get('/:type', async (req, res) => {
    try {
        const metrics = await stmts.getMetricsByType.all(req.userId, req.params.type);
        res.json({ metrics });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics.' });
    }
});

// DELETE — Remove metric
router.delete('/:id', async (req, res) => {
    try {
        const result = await stmts.deleteMetric.run(Number(req.params.id), req.userId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Metric not found.' });
        }
        res.json({ message: 'Metric deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete metric.' });
    }
});

function getDefaultUnit(type) {
    const units = {
        heart_rate: 'bpm', blood_pressure_sys: 'mmHg', blood_pressure_dia: 'mmHg',
        weight: 'kg', height: 'cm', steps: 'steps', sleep_hours: 'hours',
        water_intake: 'ml', calories: 'kcal', blood_sugar: 'mg/dL',
        temperature: '°C', oxygen_saturation: '%',
    };
    return units[type] || '';
}
// GET /api/health-data/export/csv — Download all metrics as CSV
router.get('/export/csv', async (req, res) => {
    try {
        const metrics = await stmts.getMetrics.all(req.userId);
        const symptomLogs = await stmts.getSymptomLogs.all(req.userId);

        // Build CSV content
        let csv = 'Section,Type,Value,Unit,Notes,Date\n';

        // Health metrics
        metrics.forEach(m => {
            const notes = (m.notes || '').replace(/"/g, '""');
            csv += `"Health Metric","${m.metric_type}","${m.value}","${m.unit || ''}","${notes}","${m.recorded_at}"\n`;
        });

        // Symptom logs
        symptomLogs.forEach(s => {
            const symptom = (s.symptom || '').replace(/"/g, '""');
            csv += `"Symptom Log","${s.module || ''}","${s.severity}","severity","${symptom}","${s.logged_at}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="mediguide-health-data-${new Date().toISOString().slice(0, 10)}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error.message);
        res.status(500).json({ error: 'Failed to export data.' });
    }
});

module.exports = router;
