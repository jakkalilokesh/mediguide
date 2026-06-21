/**
 * Authentication Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/profile
 * PUT  /api/auth/profile
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { stmts } = require('../db/database');
const { generateToken, requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
    handler: (req, res, next, options) => {
        const timestamp = new Date().toISOString();
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        console.log(`⚠️ [${timestamp}] Rate limit exceeded {"ip":"${ip}"}`);
        res.status(options.statusCode).json(options.message);
    }
});

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};

// POST /api/auth/register
router.post('/register', authLimiter, [
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('name').notEmpty().withMessage('Name is required.').trim().escape()
], validate, async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        const existing = await stmts.getUserByEmail.get(email);
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await stmts.createUser.run(email, hashedPassword, name);
        const token = generateToken(result.lastInsertRowid);

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: {
                id: result.lastInsertRowid,
                email: email,
                name: name,
            },
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
], validate, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await stmts.getUserByEmail.get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user.id);

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
                gender: user.gender,
            },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Failed to log in. Please try again.' });
    }
});

// GET /api/auth/profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await stmts.getUserById.get(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Parse JSON fields
        user.allergies = JSON.parse(user.allergies || '[]');
        user.conditions = JSON.parse(user.conditions || '[]');
        user.medications = JSON.parse(user.medications || '[]');

        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error.message);
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, [
    body('name').optional().trim().escape(),
    body('age').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0, max: 120 }).withMessage('Valid age is required.'),
    body('gender').optional({ nullable: true, checkFalsy: true }).trim().escape(),
    body('allergies').optional().isArray(),
    body('conditions').optional().isArray(),
    body('medications').optional().isArray(),
    body('blood_type').optional({ nullable: true, checkFalsy: true }).trim().escape(),
    body('language').optional({ nullable: true, checkFalsy: true }).trim().escape(),
], validate, async (req, res) => {
    try {
        const { name, age, gender, allergies, conditions, medications, blood_type, language } = req.body;

        const user = await stmts.getUserById.get(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        await stmts.updateProfile.run(
            name || user.name,
            age || user.age,
            gender || user.gender,
            JSON.stringify(allergies || JSON.parse(user.allergies || '[]')),
            JSON.stringify(conditions || JSON.parse(user.conditions || '[]')),
            JSON.stringify(medications || JSON.parse(user.medications || '[]')),
            blood_type || user.blood_type,
            language || user.language,
            req.userId
        );

        const updated = await stmts.getUserById.get(req.userId);
        updated.allergies = JSON.parse(updated.allergies || '[]');
        updated.conditions = JSON.parse(updated.conditions || '[]');
        updated.medications = JSON.parse(updated.medications || '[]');

        res.json({ message: 'Profile updated successfully!', user: updated });
    } catch (error) {
        console.error('Update profile error:', error.message);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

module.exports = router;
