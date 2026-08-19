import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { db } from '../db';
import { generateId } from '../utils';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// POST /auth/register - Register new agent
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingAgent = await db.get('SELECT * FROM agents WHERE email = ?', [email]);
    if (existingAgent) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const agentId = generateId();
    const hashedPassword = bcryptjs.hashSync(password, 10);

    await db.run(
      'INSERT INTO agents (id, name, email, password) VALUES (?, ?, ?, ?)',
      [agentId, name, email, hashedPassword]
    );

    const token = jwt.sign({ agentId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      agentId,
      email,
      name,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login - Login agent
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const agent = await db.get('SELECT * FROM agents WHERE email = ?', [email]);

    if (!agent || !bcryptjs.compareSync(password, agent.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ agentId: agent.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      agentId: agent.id,
      email: agent.email,
      name: agent.name,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
