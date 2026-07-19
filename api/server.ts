import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';
import { connectDB } from '../src/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err);
  }
  return app(req, res);
}
