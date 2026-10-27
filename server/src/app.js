import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import caseRoutes from './routes/caseRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isDbConnected } from './config/db.js';

dotenv.config();

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

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Mystery Room API',
    database: isDbConnected() ? 'connected' : 'memory-fallback',
    phase: 'Phase 4 - Production Ready Core',
  });
});

// Mount Case API Routes
app.use('/api/cases', caseRoutes);

// Centralized Safe Error Handling Middleware
app.use(errorHandler);

export default app;
