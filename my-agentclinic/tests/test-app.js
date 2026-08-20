const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

function createTestApp(dbPath = path.join(process.cwd(), 'tests/test.db')) {
  const app = express();
  let db = new sqlite3.Database(dbPath);

  const JWT_SECRET = 'test-secret';

  // Utility functions
  function generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Initialize database tables
  async function initializeDb() {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS agents (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS ailments (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS therapies (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          description TEXT NOT NULL,
          duration INTEGER NOT NULL,
          staffRequired INTEGER DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS therapy_ailments (
          therapyId TEXT NOT NULL,
          ailmentId TEXT NOT NULL,
          PRIMARY KEY (therapyId, ailmentId),
          FOREIGN KEY (therapyId) REFERENCES therapies(id),
          FOREIGN KEY (ailmentId) REFERENCES ailments(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          agentId TEXT NOT NULL,
          therapyId TEXT NOT NULL,
          scheduledAt DATETIME NOT NULL,
          status TEXT DEFAULT 'scheduled',
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (agentId) REFERENCES agents(id),
          FOREIGN KEY (therapyId) REFERENCES therapies(id)
        )`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // Express middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Auth middleware
  function authMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.agentId = decoded.agentId;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Routes
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/ailments', async (req, res) => {
    try {
      const { category } = req.query;
      let sql = 'SELECT * FROM ailments';
      const params = [];

      if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
      }

      const ailments = await dbAll(sql, params);
      res.json(ailments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ailments' });
    }
  });

  app.get('/ailments/:id', async (req, res) => {
    try {
      const ailment = await dbGet('SELECT * FROM ailments WHERE id = ?', [req.params.id]);
      if (!ailment) {
        return res.status(404).json({ error: 'Ailment not found' });
      }
      res.json(ailment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ailment' });
    }
  });

  app.get('/therapies', async (req, res) => {
    try {
      const { ailmentId } = req.query;
      let therapies;

      if (ailmentId) {
        const sql = `
          SELECT DISTINCT t.* FROM therapies t
          INNER JOIN therapy_ailments ta ON t.id = ta.therapyId
          WHERE ta.ailmentId = ?
        `;
        therapies = await dbAll(sql, [ailmentId]);
      } else {
        therapies = await dbAll('SELECT * FROM therapies');
      }

      for (const therapy of therapies) {
        const ailments = await dbAll(
          `SELECT a.* FROM ailments a
           INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
           WHERE ta.therapyId = ?`,
          [therapy.id]
        );
        therapy.ailments = ailments;
      }

      res.json(therapies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch therapies' });
    }
  });

  app.get('/therapies/:id', async (req, res) => {
    try {
      const therapy = await dbGet('SELECT * FROM therapies WHERE id = ?', [req.params.id]);
      if (!therapy) {
        return res.status(404).json({ error: 'Therapy not found' });
      }

      const ailments = await dbAll(
        `SELECT a.* FROM ailments a
         INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
         WHERE ta.therapyId = ?`,
        [therapy.id]
      );

      res.json({ ...therapy, ailments });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch therapy' });
    }
  });

  app.post('/appointments', authMiddleware, async (req, res) => {
    try {
      const { therapyId, scheduledAt, notes } = req.body;

      if (!therapyId || !scheduledAt) {
        return res.status(400).json({ error: 'therapyId and scheduledAt are required' });
      }

      const therapy = await dbGet('SELECT * FROM therapies WHERE id = ?', [therapyId]);
      if (!therapy) {
        return res.status(404).json({ error: 'Therapy not found' });
      }

      const appointmentId = generateId();
      await dbRun(
        `INSERT INTO appointments (id, agentId, therapyId, scheduledAt, notes, status)
         VALUES (?, ?, ?, ?, ?, 'scheduled')`,
        [appointmentId, req.agentId, therapyId, scheduledAt, notes || null]
      );

      const appointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  });

  app.get('/appointments', authMiddleware, async (req, res) => {
    try {
      const appointments = await dbAll(
        `SELECT a.*, t.name as therapyName, t.duration
         FROM appointments a
         INNER JOIN therapies t ON a.therapyId = t.id
         WHERE a.agentId = ?
         ORDER BY a.scheduledAt DESC`,
        [req.agentId]
      );

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  app.post('/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email, and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingAgent = await dbGet('SELECT * FROM agents WHERE email = ?', [email]);
      if (existingAgent) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const agentId = generateId();
      const hashedPassword = bcryptjs.hashSync(password, 10);

      await dbRun(
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
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
      }

      const agent = await dbGet('SELECT * FROM agents WHERE email = ?', [email]);

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
      res.status(500).json({ error: 'Login failed' });
    }
  });

  return {
    app,
    initializeDb,
    dbRun,
    dbGet,
    dbAll,
    generateId,
    closeDb: () => db.close()
  };
}

module.exports = { createTestApp };
