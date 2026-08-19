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
// GET /therapies - List all therapies with optional ailment filter
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ailmentId } = req.query;
        let therapies;
        if (ailmentId) {
            const query = `
        SELECT DISTINCT t.* FROM therapies t
        INNER JOIN therapy_ailments ta ON t.id = ta.therapyId
        WHERE ta.ailmentId = ?
      `;
            therapies = yield db_1.db.all(query, [ailmentId]);
        }
        else {
            therapies = yield db_1.db.all('SELECT * FROM therapies');
        }
        // Fetch ailments for each therapy
        for (const therapy of therapies) {
            const ailments = yield db_1.db.all(`SELECT a.* FROM ailments a
         INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
         WHERE ta.therapyId = ?`, [therapy.id]);
            therapy.ailments = ailments;
        }
        res.json(therapies);
    }
    catch (error) {
        console.error('Error fetching therapies:', error);
        res.status(500).json({ error: 'Failed to fetch therapies' });
    }
}));
// GET /therapies/:id - Get specific therapy
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapy = yield db_1.db.get('SELECT * FROM therapies WHERE id = ?', [req.params.id]);
        if (!therapy) {
            return res.status(404).json({ error: 'Therapy not found' });
        }
        const ailments = yield db_1.db.all(`SELECT a.* FROM ailments a
       INNER JOIN therapy_ailments ta ON a.id = ta.ailmentId
       WHERE ta.therapyId = ?`, [therapy.id]);
        res.json(Object.assign(Object.assign({}, therapy), { ailments }));
    }
    catch (error) {
        console.error('Error fetching therapy:', error);
        res.status(500).json({ error: 'Failed to fetch therapy' });
    }
}));
exports.default = router;
