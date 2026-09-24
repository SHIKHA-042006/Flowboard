import http from 'http';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { initSockets } from './sockets/index.js';

async function start() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);
  const io = initSockets(server);

  // Controllers reach the socket server through the app, which keeps them
  // testable and avoids a module-level singleton.
  app.set('io', io);

  server.listen(env.port, () => {
    console.log(`API ready on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = () => {
    console.log('Shutting down');
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
