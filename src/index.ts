import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import serviceRoutes from './routes/services';
import aiRoutes from './routes/ai';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import { handleStripeWebhook } from './controllers/orderController';
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhook needs raw body — must be before express.json
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'SkillSprint AI Backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

declare global {
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI!;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const cache = (global._mongooseCache = global._mongooseCache || { conn: null, promise: null });

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  console.log('MongoDB connected');

  try {
    const existing = await User.findOne({ email: 'demo@skillsprint.ai' });
    if (!existing) {
      await User.create({
        name: 'Demo User',
        email: 'demo@skillsprint.ai',
        password: await bcrypt.hash('demo123456', 12),
        role: 'mentor',
        skillsInterested: ['React', 'Node.js', 'TypeScript', 'Python'],
        goals: ['Learn full-stack development', 'Build AI applications'],
      });
      console.log('Demo user created (demo@skillsprint.ai / demo123456)');
    }

    const adminExists = await User.findOne({ email: 'admin@skillsprint.ai' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@skillsprint.ai',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        skillsInterested: [],
        goals: [],
      });
      console.log('Admin user created (admin@skillsprint.ai / admin123)');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }

  return cache.conn;
}

export { connectDB };

// Only start server when run directly (not imported by Vercel)
const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}
