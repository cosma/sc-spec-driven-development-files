import express, { Request, Response } from 'express';
import { db } from '../db';

const router = express.Router();

// GET /ailments - List all ailments with optional category filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM ailments';
    const params: any[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    const ailments = await db.all(query, params);
    res.json(ailments);
  } catch (error) {
    console.error('Error fetching ailments:', error);
    res.status(500).json({ error: 'Failed to fetch ailments' });
  }
});

// GET /ailments/:id - Get specific ailment
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ailment = await db.get('SELECT * FROM ailments WHERE id = ?', [req.params.id]);

    if (!ailment) {
      return res.status(404).json({ error: 'Ailment not found' });
    }

    res.json(ailment);
  } catch (error) {
    console.error('Error fetching ailment:', error);
    res.status(500).json({ error: 'Failed to fetch ailment' });
  }
});

export default router;
