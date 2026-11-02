import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import caseRoutes from './routes/caseRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isDbConnected } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables gracefully from current dir, server dir, or root dir
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
  dotenv.config({ path: path.resolve(__dirname, '../../.env.production') });
}

const app = express();

// Allowed origins parser supporting single or comma-delimited origins
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or matched origins
    if (!origin || clientOrigins.includes(origin) || clientOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

import * as caseController from './controllers/caseController.js';

// Root Welcome & Diagnostic Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AI Mystery Room API',
    database: isDbConnected() ? 'connected (MongoDB Atlas)' : 'memory-fallback',
    phase: 'Phase 9 - Production Verified',
    endpoints: {
      health: '/api/health',
      cases: '/api/cases',
      stats: '/api/stats',
      achievements: '/api/achievements',
    },
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Mystery Room API',
    database: isDbConnected() ? 'connected' : 'memory-fallback',
    phase: 'Phase 9 - Production Verified',
  });
});

// Direct Aliases for Stats and Achievements
app.get('/api/stats', caseController.getPlayerStats);
app.get('/api/achievements', caseController.getPlayerAchievements);

// Mount Case API Routes
app.use('/api/cases', caseRoutes);

// Centralized Safe Error Handling Middleware
app.use(errorHandler);

export default app;
