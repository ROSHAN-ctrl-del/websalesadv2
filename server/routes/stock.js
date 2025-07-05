import express from 'express';
import { authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Demo stock data
let stockItems = [
  {
    id: '1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    currentStock: 150,
    minStock: 20,
    maxStock: 500,
    unitPrice: 99.99,
    totalValue: 14998.50,
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'in_stock',
  },
  {
    id: '2',
    name: 'Smartphone Case',
    category: 'Accessories',
    currentStock: 15,
    minStock: 50,
    maxStock: 200,
    unitPrice: 24.99,
    totalValue: 374.85,
    lastUpdated: '2024-01-14T16:45:00Z',
    status: 'low_stock',
  },
  {
    id: '3',
    name: 'Laptop Stand',
    category: 'Office Supplies',
    currentStock: 0,
    minStock: 10,
    maxStock: 100,
    unitPrice: 45.99,
    totalValue: 0,
    lastUpdated: '2024-01-12T09:15:00Z',
    status: 'out_of_stock',
  },
];

// Get all stock items
router.get('/', (req, res) => {
  res.json(stockItems);
});

// Create new product (Super Admin only)
router.post('/', authorizeRole(['super_admin']), (req, res) => {
  const newItem = {
    id: Date.now().toString(),
    ...req.body,
    totalValue: req.body.currentStock * req.body.unitPrice,
    lastUpdated: new Date().toISOString(),
    status: req.body.currentStock === 0 ? 'out_of_stock' : 
            req.body.currentStock <= req.body.minStock ? 'low_stock' : 'in_stock',
  };
  stockItems.push(newItem);
  res.status(201).json(newItem);
});

// Update product (Super Admin only)
router.put('/:id', authorizeRole(['super_admin']), (req, res) => {
  const id = req.params.id;
  const index = stockItems.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const updatedItem = {
    ...stockItems[index],
    ...req.body,
    totalValue: (req.body.currentStock || stockItems[index].currentStock) * 
                (req.body.unitPrice || stockItems[index].unitPrice),
    lastUpdated: new Date().toISOString(),
  };
  
  // Update status based on stock level
  updatedItem.status = updatedItem.currentStock === 0 ? 'out_of_stock' : 
                      updatedItem.currentStock <= updatedItem.minStock ? 'low_stock' : 'in_stock';
  
  stockItems[index] = updatedItem;
  res.json(updatedItem);
});

// Delete product (Super Admin only)
router.delete('/:id', authorizeRole(['super_admin']), (req, res) => {
  const id = req.params.id;
  stockItems = stockItems.filter(item => item.id !== id);
  res.json({ message: 'Product deleted successfully' });
});

// Get low stock alerts
router.get('/alerts', (req, res) => {
  const alerts = stockItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
  res.json(alerts);
});

export default router;