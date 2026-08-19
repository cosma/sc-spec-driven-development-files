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
const db_1 = require("./db");
const utils_1 = require("./utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Initializing database...');
            yield db_1.db.initialize();
            console.log('Seeding database...');
            // Clear existing data
            yield db_1.db.run('DELETE FROM therapy_ailments');
            yield db_1.db.run('DELETE FROM appointments');
            yield db_1.db.run('DELETE FROM therapies');
            yield db_1.db.run('DELETE FROM ailments');
            yield db_1.db.run('DELETE FROM agents');
            // Create ailments
            const ailmentIds = [];
            const ailments = [
                { name: 'Anxiety', description: 'Persistent worry and nervousness', category: 'Mental Health' },
                { name: 'Depression', description: 'Persistent low mood and loss of interest', category: 'Mental Health' },
                { name: 'Insomnia', description: 'Difficulty falling or staying asleep', category: 'Sleep Disorders' },
                { name: 'Chronic Pain', description: 'Long-term pain conditions', category: 'Physical Health' },
                { name: 'Stress', description: 'Overwhelming stress from work or life', category: 'Mental Health' }
            ];
            for (const ailment of ailments) {
                const id = utils_1.generateId();
                yield db_1.db.run('INSERT INTO ailments (id, name, description, category) VALUES (?, ?, ?, ?)', [id, ailment.name, ailment.description, ailment.category]);
                ailmentIds.push(id);
            }
            console.log(`Created ${ailments.length} ailments`);
            // Create therapies with ailment mappings
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
                const id = utils_1.generateId();
                yield db_1.db.run('INSERT INTO therapies (id, name, description, duration, staffRequired) VALUES (?, ?, ?, ?, ?)', [id, therapy.name, therapy.description, therapy.duration, therapy.staffRequired]);
                // Link therapies to ailments
                for (const ailmentIdx of therapy.ailmentIndices) {
                    yield db_1.db.run('INSERT INTO therapy_ailments (therapyId, ailmentId) VALUES (?, ?)', [id, ailmentIds[ailmentIdx]]);
                }
            }
            console.log(`Created ${therapies.length} therapies`);
            // Create sample agent
            const agentId = utils_1.generateId();
            const hashedPassword = bcryptjs_1.default.hashSync('password123', 10);
            yield db_1.db.run('INSERT INTO agents (id, name, email, password) VALUES (?, ?, ?, ?)', [agentId, 'Claude', 'claude@agentclinic.local', hashedPassword]);
            console.log('Database seeded successfully!');
            yield db_1.db.close();
        }
        catch (error) {
            console.error('Seeding error:', error);
            process.exit(1);
        }
    });
}
seed();
