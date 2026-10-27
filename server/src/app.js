import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import caseRoutes from './routes/caseRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isDbConnected } from './config/db.js';

dotenv.config();

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
    phase: 'Phase 2 - Backend Foundation',
  });
});

// Mount Case API Routes
app.use('/api/cases', caseRoutes);

// Centralized Safe Error Handling Middleware
app.use(errorHandler);

export default app;
