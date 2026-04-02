require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const wineRoutes = require('./routes/wines');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request logger ────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wines', wineRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Error handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Seed Admin User ───────────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const User = require('./models/User');
    const adminEmail = 'mmanishsharma483@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log('👤 Seeding Admin User...');
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'manish@2004',
        role: 'admin',
        isApproved: true,
      });
      console.log('✅ Admin User seeded successfully');
    } else {
      // Ensure existing admin has the correct role and is approved
      if (existingAdmin.role !== 'admin' || !existingAdmin.isApproved) {
        existingAdmin.role = 'admin';
        existingAdmin.isApproved = true;
        await existingAdmin.save();
        console.log('✅ Admin User permissions updated');
      } else {
        console.log('👤 Admin User already exists and is active');
      }
    }
  } catch (err) {
    console.error('❌ Admin seeding failed:', err.message);
  }
}

// ─── Connect to MongoDB & start server ─────────────────────────────────────
async function start() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🍷 Vino Vault API running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

start();
