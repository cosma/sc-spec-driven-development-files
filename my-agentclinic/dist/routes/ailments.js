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
const router = express_1.default.Router();
// GET /ailments - List all ailments with optional category filter
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM ailments';
        const params = [];
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }
        const ailments = yield db_1.db.all(query, params);
        res.json(ailments);
    }
    catch (error) {
        console.error('Error fetching ailments:', error);
        res.status(500).json({ error: 'Failed to fetch ailments' });
    }
}));
// GET /ailments/:id - Get specific ailment
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ailment = yield db_1.db.get('SELECT * FROM ailments WHERE id = ?', [req.params.id]);
        if (!ailment) {
            return res.status(404).json({ error: 'Ailment not found' });
        }
        res.json(ailment);
    }
    catch (error) {
        console.error('Error fetching ailment:', error);
        res.status(500).json({ error: 'Failed to fetch ailment' });
    }
}));
exports.default = router;
