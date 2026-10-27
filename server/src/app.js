import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Mystery Room API',
    phase: 'Phase 0 - Scaffolding'
  });
});

// Centralized Safe Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = err.isOperational 
    ? err.message 
    : 'An unexpected internal error occurred. Please try again.';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: errorMessage,
    }
  });
});

export default app;
