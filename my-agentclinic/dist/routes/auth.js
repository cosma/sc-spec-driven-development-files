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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const utils_1 = require("../utils");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
// POST /auth/register - Register new agent
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'name, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        // Check if email already exists
        const existingAgent = yield db_1.db.get('SELECT * FROM agents WHERE email = ?', [email]);
        if (existingAgent) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const agentId = utils_1.generateId();
        const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
        yield db_1.db.run('INSERT INTO agents (id, name, email, password) VALUES (?, ?, ?, ?)', [agentId, name, email, hashedPassword]);
        const token = jsonwebtoken_1.default.sign({ agentId }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            agentId,
            email,
            name,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
}));
// POST /auth/login - Login agent
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }
        const agent = yield db_1.db.get('SELECT * FROM agents WHERE email = ?', [email]);
        if (!agent || !bcryptjs_1.default.compareSync(password, agent.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ agentId: agent.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            agentId: agent.id,
            email: agent.email,
            name: agent.name,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}));
exports.default = router;
