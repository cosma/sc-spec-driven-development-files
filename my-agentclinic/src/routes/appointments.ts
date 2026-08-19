import express, { Response } from 'express';
import { db } from '../db';
import { generateId } from '../utils';
import { authMiddleware, AuthRequest } from '../app';

const router = express.Router();

// POST /appointments - Create new appointment (requires auth)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { therapyId, scheduledAt, notes } = req.body;

    if (!therapyId || !scheduledAt) {
      return res.status(400).json({ error: 'therapyId and scheduledAt are required' });
    }

    if (!req.agentId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate therapy exists
    const therapy = await db.get('SELECT * FROM therapies WHERE id = ?', [therapyId]);
    if (!therapy) {
      return res.status(404).json({ error: 'Therapy not found' });
    }

    const appointmentId = generateId();
    await db.run(
      `INSERT INTO appointments (id, agentId, therapyId, scheduledAt, notes, status)
       VALUES (?, ?, ?, ?, ?, 'scheduled')`,
      [appointmentId, req.agentId, therapyId, scheduledAt, notes || null]
    );

    const appointment = await db.get('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// GET /appointments/agent/:agentId - Get agent's appointments (requires auth)
router.get('/agent/:agentId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow agents to view their own appointments
    if (req.agentId !== req.params.agentId && req.agent.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const appointments = await db.all(
      `SELECT a.*, t.name as therapyName, t.duration
       FROM appointments a
       INNER JOIN therapies t ON a.therapyId = t.id
       WHERE a.agentId = ?
       ORDER BY a.scheduledAt DESC`,
      [req.params.agentId]
    );

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /appointments - Get current agent's appointments (requires auth)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.agentId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const appointments = await db.all(
      `SELECT a.*, t.name as therapyName, t.duration
       FROM appointments a
       INNER JOIN therapies t ON a.therapyId = t.id
       WHERE a.agentId = ?
       ORDER BY a.scheduledAt DESC`,
      [req.agentId]
    );

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

export default router;
