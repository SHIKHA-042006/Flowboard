import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env, isProd } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientUrls, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(isProd ? 'combined' : 'dev'));
  app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 600 }));

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
