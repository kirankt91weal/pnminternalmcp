"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    paynearme: {
        siteId: process.env.PNM_SITE_ID,
        apiKey: process.env.PNM_API_KEY,
        apiUrl: process.env.PNM_API_URL || 'https://api.paynearme.com/api',
        version: process.env.PNM_API_VERSION || '2.0'
    },
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development'
    }
};
// Validate required configuration
const requiredEnvVars = ['PNM_SITE_ID', 'PNM_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
