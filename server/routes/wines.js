const express = require('express');
const router = express.Router();
const Wine = require('../models/Wine');
const auth = require('../middleware/authMiddleware');

// Apply auth to ALL wine routes
router.use(auth);

// ─── GET all wines (with search & filter) ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, type, date, startDate, endDate, sortField = 'name', sortOrder = 'asc' } = req.query;

    const query = { userId: req.userId };

    if (type && type !== 'All') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
        { shopPlace: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    } else if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const sortDir = sortOrder === 'desc' ? -1 : 1;
    const sortObj = { [sortField]: sortDir };

    const wines = await Wine.find(query).sort(sortObj);
    res.json(wines);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET single wine ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const wine = await Wine.findOne({ _id: req.params.id, userId: req.userId });
    if (!wine) return res.status(404).json({ message: 'Wine not found' });
    res.json(wine);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── POST add wine ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk add
      const winesData = req.body.map(item => ({ ...item, userId: req.userId }));
      const wines = await Wine.insertMany(winesData);
      return res.status(201).json(wines);
    } else {
      // Single add
      const wineData = { ...req.body, userId: req.userId };
      const wine = new Wine(wineData);
      await wine.save();
      return res.status(201).json(wine);
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── PUT update wine ─────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const wine = await Wine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!wine) return res.status(404).json({ message: 'Wine not found or unauthorized' });
    res.json(wine);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── PATCH update quantity only ──────────────────────────────────────────────
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { delta } = req.body; 
    const wine = await Wine.findOne({ _id: req.params.id, userId: req.userId });
    if (!wine) return res.status(404).json({ message: 'Wine not found or unauthorized' });

    // If delta is negative, it's a sale. Increment the sold counter.
    if (delta < 0) {
      const soldAmount = Math.min(wine.quantity, Math.abs(delta));
      wine.sold = (wine.sold || 0) + soldAmount;
    }

    wine.quantity = Math.max(0, wine.quantity + delta);
    await wine.save();
    res.json(wine);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── DELETE wine ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const wine = await Wine.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!wine) return res.status(404).json({ message: 'Wine not found or unauthorized' });
    res.json({ message: 'Wine deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET stats ───────────────────────────────────────────────────────────────
router.get('/meta/stats', async (req, res) => {
  try {
    const wines = await Wine.find({ userId: req.userId });
    const stats = {
      total: wines.length,
      totalBottles: wines.reduce((s, w) => s + w.quantity, 0),
      totalValue: wines.reduce((s, w) => s + (w.sellingPrice || 0) * w.quantity, 0),
      totalCost: wines.reduce((s, w) => s + (w.price || 0) * w.quantity, 0),
      totalOtherExpenses: wines.reduce((s, w) => s + (w.otherExpense || 0), 0),
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
