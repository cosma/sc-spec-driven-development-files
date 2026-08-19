import express, { Request, Response } from 'express';
import { db } from '../db';

const router = express.Router();

// GET /therapies - List all therapies with optional ailment filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const { ailmentId } = req.query;
    let therapies;

    if (ailmentId) {
      const query = `
        SELECT DISTINCT t.* FROM therapies t
        INNER JOIN therapy_ailments ta ON t.id = ta.therapyId
        WHERE ta.ailmentId = ?
      `;
      therapies = await db.all(query, [ailmentId]);
    } else {
      therapies = await db.all('SELECT * FROM therapies');
    }

    // Fetch ailments for each therapy
    for (const therapy of therapies) {
      const ailments = await db.all(
        `SELECT a.* FROM ailments a
         INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
         WHERE ta.therapyId = ?`,
        [therapy.id]
      );
      (therapy as any).ailments = ailments;
    }

    res.json(therapies);
  } catch (error) {
    console.error('Error fetching therapies:', error);
    res.status(500).json({ error: 'Failed to fetch therapies' });
  }
});

// GET /therapies/:id - Get specific therapy
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const therapy = await db.get('SELECT * FROM therapies WHERE id = ?', [req.params.id]);

    if (!therapy) {
      return res.status(404).json({ error: 'Therapy not found' });
    }

    const ailments = await db.all(
      `SELECT a.* FROM ailments a
       INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
       WHERE ta.therapyId = ?`,
      [therapy.id]
    );

    res.json({ ...therapy, ailments });
  } catch (error) {
    console.error('Error fetching therapy:', error);
    res.status(500).json({ error: 'Failed to fetch therapy' });
  }
});

export default router;
