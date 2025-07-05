import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all sales persons
router.get('/', authenticateToken, async (req, res) => {
  try {
    const SalesPerson = (await import('../models/SalesPerson.js')).default;
    const salesPersons = await SalesPerson.find();
    res.json(salesPersons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales persons' });
  }
});

// Get single sales person
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const SalesPerson = (await import('../models/SalesPerson.js')).default;
    const salesPerson = await SalesPerson.findById(req.params.id);
    if (!salesPerson) return res.status(404).json({ error: 'Sales person not found' });
    res.json(salesPerson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales person' });
  }
});

// Create new sales person
router.post('/', authenticateToken, async (req, res) => {
  try {
    const SalesPerson = (await import('../models/SalesPerson.js')).default;
    const { name, email, phone, region, password, salesAdminId } = req.body;
    if (!name || !email || !phone || !region || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await SalesPerson.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSalesPerson = new SalesPerson({ name, email, phone, region, password: hashedPassword, salesAdminId });
    await newSalesPerson.save();
    res.status(201).json(newSalesPerson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sales person', details: error.message });
  }
});

// Update sales person
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const SalesPerson = (await import('../models/SalesPerson.js')).default;
    const { name, email, phone, region, status, password, currentLocation, totalSales, dealsCount, lastActivity, salesAdminId } = req.body;
    const update = { name, email, phone, region, status, currentLocation, totalSales, dealsCount, lastActivity, salesAdminId };
    if (password) update.password = await bcrypt.hash(password, 10);

    const salesPerson = await SalesPerson.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!salesPerson) return res.status(404).json({ error: 'Sales person not found' });
    res.json(salesPerson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sales person' });
  }
});

// Delete sales person
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const SalesPerson = (await import('../models/SalesPerson.js')).default;
    await SalesPerson.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sales person' });
  }
});

export default router;
