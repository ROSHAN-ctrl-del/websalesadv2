import express from 'express';

const router = express.Router();

// Demo sales data
const sales = [
  {
    id: '1',
    customerId: '1',
    salesPersonId: '1',
    products: [
      { productId: '1', quantity: 2, unitPrice: 99.99, total: 199.98 },
      { productId: '2', quantity: 1, unitPrice: 24.99, total: 24.99 },
    ],
    totalAmount: 224.97,
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    customerId: '2',
    salesPersonId: '2',
    products: [
      { productId: '3', quantity: 1, unitPrice: 45.99, total: 45.99 },
    ],
    totalAmount: 45.99,
    status: 'pending',
    createdAt: '2024-01-14T16:45:00Z',
  },
];

// Get all sales
router.get('/', (req, res) => {
  res.json(sales);
});

// Create new sale
router.post('/', (req, res) => {
  const newSale = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  sales.push(newSale);
  res.status(201).json(newSale);
});

// Update sale
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const index = sales.findIndex(sale => sale.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Sale not found' });
  }
  
  sales[index] = { ...sales[index], ...req.body };
  res.json(sales[index]);
});

// Delete sale
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const index = sales.findIndex(sale => sale.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Sale not found' });
  }
  
  sales.splice(index, 1);
  res.json({ message: 'Sale deleted successfully' });
});

// Get sales statistics
router.get('/stats', (req, res) => {
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed').length;
  const pendingSales = sales.filter(sale => sale.status === 'pending').length;
  
  res.json({
    totalSales,
    totalOrders: sales.length,
    completedSales,
    pendingSales,
    averageOrderValue: totalSales / sales.length || 0,
  });
});

export default router;