const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhook needs raw body — must be before express.json
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // Delegate to the compiled webhook handler
  const { handleStripeWebhook } = require('../dist/controllers/orderController');
  return handleStripeWebhook(req, res);
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'SkillSprint AI Backend' });
});

// Load compiled routes
let routesLoaded = false;
function loadRoutes() {
  if (routesLoaded) return;
  routesLoaded = true;
  try {
    const authRoutes = require('../dist/routes/auth').default;
    const serviceRoutes = require('../dist/routes/services').default;
    const aiRoutes = require('../dist/routes/ai').default;
    const orderRoutes = require('../dist/routes/orders').default;
    const adminRoutes = require('../dist/routes/admin').default;
    app.use('/api/auth', authRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/admin', adminRoutes);
  } catch (err) {
    console.error('Route load error:', err.message);
  }
}
loadRoutes();

// MongoDB connection promise
let seedDone = false;
const dbPromise = process.env.MONGODB_URI
  ? mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }).then(async () => {
      const User = require('../dist/models/User').default;
      
      const existing = await User.findOne({ email: 'demo@skillsprint.ai' });
      if (!existing) {
        await User.create({
          name: 'Demo User', email: 'demo@skillsprint.ai',
          password: await bcrypt.hash('demo123456', 12), role: 'mentor',
          skillsInterested: ['React', 'Node.js', 'TypeScript', 'Python'],
          goals: ['Learn full-stack development', 'Build AI applications'],
        });
      }
      
      const adminExists = await User.findOne({ email: 'admin@skillsprint.ai' });
      if (!adminExists) {
        await User.create({
          name: 'Admin User', email: 'admin@skillsprint.ai',
          password: await bcrypt.hash('admin123', 12), role: 'admin',
          skillsInterested: [], goals: [],
        });
      }
      
      seedDone = true;
    }).catch(err => console.error('MongoDB error:', err))
  : Promise.resolve();

module.exports = async function handler(req, res) {
  await Promise.race([dbPromise, new Promise(r => setTimeout(r, 12000))]);
  return app(req, res);
};
