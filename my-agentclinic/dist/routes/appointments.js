"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const utils_1 = require("../utils");
const app_1 = require("../app");
const router = express_1.default.Router();
// POST /appointments - Create new appointment (requires auth)
router.post('/', app_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { therapyId, scheduledAt, notes } = req.body;
        if (!therapyId || !scheduledAt) {
            return res.status(400).json({ error: 'therapyId and scheduledAt are required' });
        }
        if (!req.agentId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        // Validate therapy exists
        const therapy = yield db_1.db.get('SELECT * FROM therapies WHERE id = ?', [therapyId]);
        if (!therapy) {
            return res.status(404).json({ error: 'Therapy not found' });
        }
        const appointmentId = utils_1.generateId();
        yield db_1.db.run(`INSERT INTO appointments (id, agentId, therapyId, scheduledAt, notes, status)
       VALUES (?, ?, ?, ?, ?, 'scheduled')`, [appointmentId, req.agentId, therapyId, scheduledAt, notes || null]);
        const appointment = yield db_1.db.get('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
        res.status(201).json(appointment);
    }
    catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
}));
// GET /appointments/agent/:agentId - Get agent's appointments (requires auth)
router.get('/agent/:agentId', app_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only allow agents to view their own appointments
        if (req.agentId !== req.params.agentId && req.agent.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const appointments = yield db_1.db.all(`SELECT a.*, t.name as therapyName, t.duration
       FROM appointments a
       INNER JOIN therapies t ON a.therapyId = t.id
       WHERE a.agentId = ?
       ORDER BY a.scheduledAt DESC`, [req.params.agentId]);
        res.json(appointments);
    }
    catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
}));
// GET /appointments - Get current agent's appointments (requires auth)
router.get('/', app_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.agentId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const appointments = yield db_1.db.all(`SELECT a.*, t.name as therapyName, t.duration
       FROM appointments a
       INNER JOIN therapies t ON a.therapyId = t.id
       WHERE a.agentId = ?
       ORDER BY a.scheduledAt DESC`, [req.agentId]);
        res.json(appointments);
    }
    catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
}));
exports.default = router;
