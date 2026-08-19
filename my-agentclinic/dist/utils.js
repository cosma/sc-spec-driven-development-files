"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimestamp = exports.generateId = void 0;
const crypto_1 = __importDefault(require("crypto"));
function generateId() {
    return crypto_1.default.randomBytes(12).toString('hex');
}
exports.generateId = generateId;
function getCurrentTimestamp() {
    return new Date().toISOString();
}
exports.getCurrentTimestamp = getCurrentTimestamp;
