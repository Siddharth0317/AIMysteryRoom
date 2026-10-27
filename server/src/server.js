import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[AI-MYSTERY-ROOM] Server active on port ${PORT}`);
  console.log(`[AI-MYSTERY-ROOM] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[AI-MYSTERY-ROOM] Status: Phase 0 Scaffolding Ready`);
});

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('[AI-MYSTERY-ROOM] SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('[AI-MYSTERY-ROOM] HTTP server closed');
  });
});

export default server;
