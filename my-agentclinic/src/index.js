import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import sqlite3 from 'sqlite3';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3Verbose = sqlite3.verbose();

// Database setup
const DB_PATH = path.join(__dirname, '../prisma/dev.db');
let db = new sqlite3Verbose.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  }
});

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
        status TEXT DEFAULT 'pending',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agentId) REFERENCES agents(id),
        FOREIGN KEY (therapyId) REFERENCES therapies(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

// Express app setup
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required for secure token handling');
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

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

// Staff Auth middleware
function staffAuthMiddleware(req, res, next) {
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
    if (!decoded.staffId) {
      return res.status(401).json({ error: 'Staff token required' });
    }
    req.staffId = decoded.staffId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ailments
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
    console.error('Error fetching ailments:', error);
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
    console.error('Error fetching ailment:', error);
    res.status(500).json({ error: 'Failed to fetch ailment' });
  }
});

// Therapies
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

    // Fetch ailments for each therapy
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
    console.error('Error fetching therapies:', error);
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
    console.error('Error fetching therapy:', error);
    res.status(500).json({ error: 'Failed to fetch therapy' });
  }
});

// Appointments
app.post('/appointments', authMiddleware, async (req, res) => {
  try {
    const { therapyId, scheduledAt, notes } = req.body;

    if (!therapyId || !scheduledAt) {
      return res.status(400).json({ error: 'therapyId and scheduledAt are required' });
    }

    // Validate therapy exists
    const therapy = await dbGet('SELECT * FROM therapies WHERE id = ?', [therapyId]);
    if (!therapy) {
      return res.status(404).json({ error: 'Therapy not found' });
    }

    const appointmentId = generateId();
    await dbRun(
      `INSERT INTO appointments (id, agentId, therapyId, scheduledAt, notes, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [appointmentId, req.agentId, therapyId, scheduledAt, notes || null]
    );

    const appointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
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
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.get('/appointments/agent/:agentId', authMiddleware, async (req, res) => {
  try {
    if (req.agentId !== req.params.agentId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot view other agents appointments' });
    }

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
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Auth
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
    console.error('Registration error:', error);
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Staff Auth
app.post('/auth/staff-register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingStaff = await dbGet('SELECT * FROM staff WHERE email = ?', [email]);
    if (existingStaff) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const staffId = generateId();
    const hashedPassword = bcryptjs.hashSync(password, 10);

    await dbRun(
      'INSERT INTO staff (id, name, email, password) VALUES (?, ?, ?, ?)',
      [staffId, name, email, hashedPassword]
    );

    const token = jwt.sign({ staffId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      staffId,
      email,
      name,
      token
    });
  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/staff-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const staff = await dbGet('SELECT * FROM staff WHERE email = ?', [email]);

    if (!staff || !bcryptjs.compareSync(password, staff.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ staffId: staff.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      staffId: staff.id,
      email: staff.email,
      name: staff.name,
      token
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Staff Appointment Management
app.get('/staff/appointments', staffAuthMiddleware, async (req, res) => {
  try {
    const { status, agentId, startDate, endDate, search, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT a.*, t.name as therapyName, t.duration, ag.name as agentName
      FROM appointments a
      INNER JOIN therapies t ON a.therapyId = t.id
      INNER JOIN agents ag ON a.agentId = ag.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (agentId) {
      sql += ' AND a.agentId = ?';
      params.push(agentId);
    }

    if (startDate) {
      sql += ' AND a.scheduledAt >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND a.scheduledAt <= ?';
      params.push(endDate);
    }

    if (search) {
      sql += ' AND (ag.name LIKE ? OR t.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY a.scheduledAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const appointments = await dbAll(sql, params);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching staff appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.get('/staff/appointments/:id', staffAuthMiddleware, async (req, res) => {
  try {
    const appointment = await dbGet(
      `SELECT a.*, t.name as therapyName, t.duration, ag.name as agentName, ag.email as agentEmail
       FROM appointments a
       INNER JOIN therapies t ON a.therapyId = t.id
       INNER JOIN agents ag ON a.agentId = ag.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

app.patch('/appointments/:id', staffAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await dbRun(
      'UPDATE appointments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.id]
    );

    const updatedAppointment = await dbGet('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Staff Agent Wellness Metrics
app.get('/staff/agents', staffAuthMiddleware, async (req, res) => {
  try {
    const agents = await dbAll('SELECT id, name, email, createdAt FROM agents');

    for (const agent of agents) {
      const stats = await dbGet(
        `SELECT
          COUNT(*) as totalAppointments,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedAppointments
         FROM appointments WHERE agentId = ?`,
        [agent.id]
      );

      const wellnessScore = stats.totalAppointments > 0
        ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
        : 0;

      const lastAppointment = await dbGet(
        `SELECT scheduledAt FROM appointments WHERE agentId = ? ORDER BY scheduledAt DESC LIMIT 1`,
        [agent.id]
      );

      agent.wellnessScore = wellnessScore;
      agent.totalAppointments = stats.totalAppointments || 0;
      agent.completedAppointments = stats.completedAppointments || 0;
      agent.lastAppointmentAt = lastAppointment ? lastAppointment.scheduledAt : null;
    }

    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

app.get('/staff/agents/:id', staffAuthMiddleware, async (req, res) => {
  try {
    const agent = await dbGet('SELECT id, name, email, createdAt FROM agents WHERE id = ?', [req.params.id]);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const appointments = await dbAll(
      `SELECT a.*, t.name as therapyName, t.duration
       FROM appointments a
       INNER JOIN therapies t ON a.therapyId = t.id
       WHERE a.agentId = ?
       ORDER BY a.scheduledAt DESC`,
      [req.params.id]
    );

    const stats = await dbGet(
      `SELECT
        COUNT(*) as totalAppointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedAppointments
       FROM appointments WHERE agentId = ?`,
      [req.params.id]
    );

    const wellnessScore = stats.totalAppointments > 0
      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
      : 0;

    res.json({
      ...agent,
      wellnessScore,
      totalAppointments: stats.totalAppointments || 0,
      completedAppointments: stats.completedAppointments || 0,
      appointments
    });
  } catch (error) {
    console.error('Error fetching agent details:', error);
    res.status(500).json({ error: 'Failed to fetch agent details' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    console.log('Initializing database...');
    await initializeDb();
    console.log('Database initialized ✓');

    app.listen(PORT, () => {
      console.log(`AgentClinic API listening on port ${PORT} ✨`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
