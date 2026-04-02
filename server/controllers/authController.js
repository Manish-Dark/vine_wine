const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'vino_vault_secret_key_2026';
const JWT_EXPIRES = '7d';

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    // Only auto-login admins (if seeded or specifically registered as such)
    if (user.role === 'admin') {
      const token = jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES }
      );
      return res.status(201).json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } 
      });
    }

    // Regular users wait for approval
    res.status(201).json({ 
      message: 'Registration successful! Please wait for an admin to approve your account.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } 
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check approval
    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval by an admin.' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
