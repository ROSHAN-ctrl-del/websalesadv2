import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Fallback data when MongoDB is not available
const fallbackAdmins = [
  {
    _id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1-555-0101',
    region: 'North Region',
    status: 'active',
    salesPersonsCount: 5,
    totalSales: 125000,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0102',
    region: 'South Region',
    status: 'active',
    salesPersonsCount: 3,
    totalSales: 89000,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    phone: '+1-555-0103',
    region: 'East Region',
    status: 'inactive',
    salesPersonsCount: 0,
    totalSales: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  }
];

// Get all sales admins
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesAdmin = (await import('../models/SalesAdmin.js')).default;
      const admins = await SalesAdmin.find();
      res.json(admins);
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      console.log('Using fallback data for sales admins');
      res.json(fallbackAdmins);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales admins' });
  }
});

// Get single sales admin
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesAdmin = (await import('../models/SalesAdmin.js')).default;
      const admin = await SalesAdmin.findById(req.params.id);
      if (!admin) return res.status(404).json({ error: 'Sales admin not found' });
      res.json(admin);
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      const admin = fallbackAdmins.find(a => a._id === req.params.id);
      if (!admin) return res.status(404).json({ error: 'Sales admin not found' });
      res.json(admin);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales admin' });
  }
});

// Create new sales admin
router.post('/', authenticateToken, async (req, res) => {
  try {
    const SalesAdmin = (await import('../models/SalesAdmin.js')).default;
    const { name, email, phone, region, password } = req.body;
    if (!name || !email || !phone || !region || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await SalesAdmin.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new SalesAdmin({ name, email, phone, region, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating sales admin:', error);
    if (error && error.stack) console.error(error.stack);
    res.status(500).json({ error: 'Failed to create sales admin', details: error.message });
  }
});

// Update sales admin
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesAdmin = (await import('../models/SalesAdmin.js')).default;
      const { name, email, phone, region, status, password } = req.body;
      const update = { name, email, phone, region, status };
      if (password) update.password = await bcrypt.hash(password, 10);

      const admin = await SalesAdmin.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!admin) return res.status(404).json({ error: 'Sales admin not found' });
      res.json(admin);
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      console.log('Using fallback data for sales admin update');
      res.status(501).json({ error: 'MongoDB not available for updates' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sales admin' });
  }
});

// Delete sales admin
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesAdmin = (await import('../models/SalesAdmin.js')).default;
      await SalesAdmin.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      console.log('Using fallback data for sales admin deletion');
      res.status(501).json({ error: 'MongoDB not available for deletions' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sales admin' });
  }
});

export default router;
