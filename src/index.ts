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
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('MongoDB connected');

    // Auto-seed demo user if not exists
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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB error:', err));

export default app;
