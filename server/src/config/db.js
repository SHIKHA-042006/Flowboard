import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log('MongoDB connected');
  return mongoose.connection;
}
