import express from 'express';
import Customer from '../models/Customer.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Role-based filtering
    if (req.user.role === 'sales_person') {
      filter.assignedTo = req.user.id;
    }

    if (status) filter.status = status;
    if (assignedTo && req.user.role === 'sales_admin') filter.assignedTo = assignedTo;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const customers = await Customer.find(filter)
      .populate('assignedTo', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Customer.countDocuments(filter);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get single customer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email phone');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check permissions
    if (req.user.role === 'sales_person' && 
        customer.assignedTo && 
        customer.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const customerData = { ...req.body };
    
    // If sales person is creating, auto-assign to themselves
    if (req.user.role === 'sales_person') {
      customerData.assignedTo = req.user.id;
    }

    const customer = new Customer(customerData);
    await customer.save();
    
    await customer.populate('assignedTo', 'name email phone');

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check permissions
    if (req.user.role === 'sales_person' && 
        customer.assignedTo && 
        customer.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Object.assign(customer, req.body);
    await customer.save();
    
    await customer.populate('assignedTo', 'name email phone');

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check permissions
    if (req.user.role === 'sales_person' && 
        customer.assignedTo && 
        customer.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Get customer statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const filter = {};
    
    if (req.user.role === 'sales_person') {
      filter.assignedTo = req.user.id;
    }

    const stats = await Customer.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          potential: { $sum: { $cond: [{ $eq: ['$status', 'potential'] }, 1, 0] } },
          totalRevenue: { $sum: '$totalSpent' },
          totalOrders: { $sum: '$totalOrders' }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      potential: 0,
      totalRevenue: 0,
      totalOrders: 0
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer statistics' });
  }
});

export default router;