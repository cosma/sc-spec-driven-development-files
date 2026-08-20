import sqlite3 from 'sqlite3';
import path from 'path';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3Verbose = sqlite3.verbose();

const DB_PATH = path.join(__dirname, '../prisma/dev.db');

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function seed() {
  const db = new sqlite3Verbose.Database(DB_PATH);

  try {
    console.log('Seeding database...');

    // Create tables first
    await dbRun(db, `CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(db, `CREATE TABLE IF NOT EXISTS ailments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(db, `CREATE TABLE IF NOT EXISTS therapies (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      duration INTEGER NOT NULL,
      staffRequired INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await dbRun(db, `CREATE TABLE IF NOT EXISTS therapy_ailments (
      therapyId TEXT NOT NULL,
      ailmentId TEXT NOT NULL,
      PRIMARY KEY (therapyId, ailmentId),
      FOREIGN KEY (therapyId) REFERENCES therapies(id),
      FOREIGN KEY (ailmentId) REFERENCES ailments(id)
    )`);

    await dbRun(db, `CREATE TABLE IF NOT EXISTS appointments (
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

    await dbRun(db, `CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Clear existing data
    await dbRun(db, 'DELETE FROM therapy_ailments');
    await dbRun(db, 'DELETE FROM appointments');
    await dbRun(db, 'DELETE FROM therapies');
    await dbRun(db, 'DELETE FROM ailments');
    await dbRun(db, 'DELETE FROM agents');
    await dbRun(db, 'DELETE FROM staff');

    // Create ailments
    const ailments = [
      { name: 'Anxiety', description: 'Persistent worry and nervousness', category: 'Mental Health' },
      { name: 'Depression', description: 'Persistent low mood and loss of interest', category: 'Mental Health' },
      { name: 'Insomnia', description: 'Difficulty falling or staying asleep', category: 'Sleep Disorders' },
      { name: 'Chronic Pain', description: 'Long-term pain conditions', category: 'Physical Health' },
      { name: 'Stress', description: 'Overwhelming stress from work or life', category: 'Mental Health' }
    ];

    const ailmentIds = [];
    for (const ailment of ailments) {
      const id = generateId();
      await dbRun(
        db,
        'INSERT INTO ailments (id, name, description, category) VALUES (?, ?, ?, ?)',
        [id, ailment.name, ailment.description, ailment.category]
      );
      ailmentIds.push(id);
    }

    console.log(`Created ${ailments.length} ailments`);

    // Create therapies
    const therapies = [
      {
        name: 'Cognitive Behavioral Therapy',
        description: 'Evidence-based therapy focusing on thought patterns and behaviors',
        duration: 60,
        staffRequired: 1,
        ailmentIndices: [0, 1, 4] // Anxiety, Depression, Stress
      },
      {
        name: 'Mindfulness Meditation',
        description: 'Guided meditation to reduce stress and improve focus',
        duration: 45,
        staffRequired: 1,
        ailmentIndices: [0, 2, 4] // Anxiety, Insomnia, Stress
      },
      {
        name: 'Physical Therapy',
        description: 'Movement and exercise-based therapy for pain management',
        duration: 50,
        staffRequired: 1,
        ailmentIndices: [3] // Chronic Pain
      },
      {
        name: 'Sleep Hygiene Coaching',
        description: 'Personalized guidance to improve sleep quality and duration',
        duration: 30,
        staffRequired: 1,
        ailmentIndices: [2] // Insomnia
      },
      {
        name: 'Counseling Session',
        description: 'One-on-one counseling for emotional support and guidance',
        duration: 60,
        staffRequired: 1,
        ailmentIndices: [0, 1, 4] // Anxiety, Depression, Stress
      }
    ];

    for (const therapy of therapies) {
      const id = generateId();
      await dbRun(
        db,
        'INSERT INTO therapies (id, name, description, duration, staffRequired) VALUES (?, ?, ?, ?, ?)',
        [id, therapy.name, therapy.description, therapy.duration, therapy.staffRequired]
      );

      for (const ailmentIdx of therapy.ailmentIndices) {
        await dbRun(
          db,
          'INSERT INTO therapy_ailments (therapyId, ailmentId) VALUES (?, ?)',
          [id, ailmentIds[ailmentIdx]]
        );
      }
    }

    console.log(`Created ${therapies.length} therapies`);

    // Create sample agents
    const agents = [
      { name: 'Claude', email: 'claude@agentclinic.local' },
      { name: 'Alex', email: 'alex@agentclinic.local' },
      { name: 'Jordan', email: 'jordan@agentclinic.local' },
      { name: 'Sam', email: 'sam@agentclinic.local' },
      { name: 'Morgan', email: 'morgan@agentclinic.local' }
    ];

    const agentIds = [];
    for (const agent of agents) {
      const agentId = generateId();
      const hashedPassword = bcryptjs.hashSync('password123', 10);
      await dbRun(
        db,
        'INSERT INTO agents (id, name, email, password) VALUES (?, ?, ?, ?)',
        [agentId, agent.name, agent.email, hashedPassword]
      );
      agentIds.push(agentId);
    }

    console.log(`Created ${agents.length} agents`);

    // Create staff members
    const staffMembers = [
      { name: 'Dr. Sarah', email: 'sarah@agentclinic.local' },
      { name: 'Dr. James', email: 'james@agentclinic.local' },
      { name: 'Maria', email: 'maria@agentclinic.local' }
    ];

    for (const staff of staffMembers) {
      const staffId = generateId();
      const hashedPassword = bcryptjs.hashSync('password123', 10);
      await dbRun(
        db,
        'INSERT INTO staff (id, name, email, password) VALUES (?, ?, ?, ?)',
        [staffId, staff.name, staff.email, hashedPassword]
      );
    }

    console.log(`Created ${staffMembers.length} staff members`);

    // Get all therapies
    const allTherapies = await dbAll(db, 'SELECT id FROM therapies');

    // Create sample appointments with different statuses
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const appointmentCount = 20;

    for (let i = 0; i < appointmentCount; i++) {
      const appointmentId = generateId();
      const agentId = agentIds[i % agentIds.length];
      const therapyId = allTherapies[i % allTherapies.length].id;
      const status = statuses[Math.floor(i / 5) % statuses.length];

      // Schedule appointments over the next month
      const date = new Date();
      date.setDate(date.getDate() + (i % 20));
      date.setHours(10 + (i % 8));
      date.setMinutes(0);

      await dbRun(
        db,
        'INSERT INTO appointments (id, agentId, therapyId, scheduledAt, status) VALUES (?, ?, ?, ?, ?)',
        [appointmentId, agentId, therapyId, date.toISOString(), status]
      );
    }

    console.log(`Created ${appointmentCount} sample appointments`);
    console.log('Database seeded successfully!');
    db.close();
  } catch (error) {
    console.error('Seeding error:', error);
    db.close();
    process.exit(1);
  }
}

seed();
