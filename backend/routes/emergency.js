/**
 * Emergency Contact Routes
 * GET    /api/emergency         — Get contacts
 * POST   /api/emergency         — Add contact
 * PUT    /api/emergency/:id     — Update contact
 * DELETE /api/emergency/:id     — Delete contact
 */

const express = require('express');
const { stmts } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET — All contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await stmts.getContacts.all(req.userId);
        res.json({ contacts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contacts.' });
    }
});

// POST — Add contact
router.post('/', async (req, res) => {
    try {
        const { name, phone, relationship, is_primary } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required.' });
        }

        const result = await stmts.addContact.run(
            req.userId,
            name.trim(),
            phone.trim(),
            relationship || null,
            is_primary ? 1 : 0
        );

        res.status(201).json({
            message: 'Emergency contact added!',
            contact: { id: result.lastInsertRowid, name, phone, relationship, is_primary: !!is_primary },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add contact.' });
    }
});

// PUT — Update contact
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, relationship, is_primary } = req.body;
        const result = await stmts.updateContact.run(
            name, phone, relationship || null, is_primary ? 1 : 0,
            Number(req.params.id), req.userId
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Contact not found.' });
        }
        res.json({ message: 'Contact updated!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contact.' });
    }
});

// DELETE — Remove contact
router.delete('/:id', async (req, res) => {
    try {
        const result = await stmts.deleteContact.run(Number(req.params.id), req.userId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Contact not found.' });
        }
        res.json({ message: 'Contact deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete contact.' });
    }
});

module.exports = router;
