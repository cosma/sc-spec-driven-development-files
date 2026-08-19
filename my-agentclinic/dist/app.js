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
exports.authMiddleware = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
exports.app = express_1.default();
// Middleware
exports.app.use(cors_1.default());
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.urlencoded({ extended: true }));
// Request logging middleware
exports.app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Error handling middleware
exports.app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});
exports.authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.agentId = decoded.agentId;
        const agent = yield db_1.db.get('SELECT * FROM agents WHERE id = ?', [decoded.agentId]);
        if (!agent) {
            return res.status(401).json({ error: 'Agent not found' });
        }
        req.agent = agent;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});
// API Routes
const ailments_1 = __importDefault(require("./routes/ailments"));
const therapies_1 = __importDefault(require("./routes/therapies"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const auth_1 = __importDefault(require("./routes/auth"));
exports.app.use('/ailments', ailments_1.default);
exports.app.use('/therapies', therapies_1.default);
exports.app.use('/appointments', appointments_1.default);
exports.app.use('/auth', auth_1.default);
// Health check
exports.app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
exports.default = exports.app;
