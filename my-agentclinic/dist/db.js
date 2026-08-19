"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../prisma/dev.db');
class Database {
    constructor() {
        this.db = new sqlite3_1.default.Database(DB_PATH);
    }
    initialize() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Agents table
                this.db.run(`
          CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
                // Ailments table
                this.db.run(`
          CREATE TABLE IF NOT EXISTS ailments (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
                // Therapies table
                this.db.run(`
          CREATE TABLE IF NOT EXISTS therapies (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            duration INTEGER NOT NULL,
            staffRequired INTEGER DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
                // Therapy-Ailment junction table
                this.db.run(`
          CREATE TABLE IF NOT EXISTS therapy_ailments (
            therapyId TEXT NOT NULL,
            ailmentId TEXT NOT NULL,
            PRIMARY KEY (therapyId, ailmentId),
            FOREIGN KEY (therapyId) REFERENCES therapies(id),
            FOREIGN KEY (ailmentId) REFERENCES ailments(id)
          )
        `);
                // Appointments table
                this.db.run(`
          CREATE TABLE IF NOT EXISTS appointments (
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
          )
        `, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        });
    }
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err)
                    reject(err);
                else
                    resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.Database = Database;
exports.db = new Database();
