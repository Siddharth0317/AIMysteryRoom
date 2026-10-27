import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[AI-MYSTERY-ROOM] Server active on port ${PORT}`);
    console.log(`[AI-MYSTERY-ROOM] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[AI-MYSTERY-ROOM] Status: Phase 2 Backend Online`);
  });

  // Graceful termination handling
  process.on('SIGTERM', () => {
    console.log('[AI-MYSTERY-ROOM] SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('[AI-MYSTERY-ROOM] HTTP server closed');
    });
  });

  return server;
}

startServer();

export default app;
