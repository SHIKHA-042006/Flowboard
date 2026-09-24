import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, validated configuration.
 * Fail fast on boot rather than at the first request that needs a missing value.
 */
const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
  seedPassword: process.env.SEED_PASSWORD || 'password123',
};

export const isProd = env.nodeEnv === 'production';
