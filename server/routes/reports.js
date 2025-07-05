import express from 'express';
import { Parser } from 'json2csv';

const router = express.Router();

// Get sales report
router.get('/sales', (req, res) => {
  const { startDate, endDate, salesPersonId, region } = req.query;
  
  // Mock sales data for report
  const salesData = [
    {
      date: '2024-01-15',
      salesPerson: 'Alice Johnson',
      region: 'North',
      revenue: 2500,
      orders: 5,
      customer: 'TechCorp',
    },
    {
      date: '2024-01-14',
      salesPerson: 'Bob Smith',
      region: 'South',
      revenue: 1800,
      orders: 3,
      customer: 'RetailMax',
    },
    {
      date: '2024-01-13',
      salesPerson: 'Charlie Brown',
      region: 'East',
      revenue: 3200,
      orders: 7,
      customer: 'StartupXYZ',
    },
  ];
  
  res.json({
    data: salesData,
    summary: {
      totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
      totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
      averageOrderValue: salesData.reduce((sum, item) => sum + item.revenue, 0) / salesData.reduce((sum, item) => sum + item.orders, 0),
    },
  });
});

// Get stock report
router.get('/stock', (req, res) => {
  const { category, status } = req.query;
  
  // Mock stock data for report
  const stockData = [
    {
      product: 'Wireless Headphones',
      category: 'Electronics',
      currentStock: 150,
      minStock: 20,
      value: 14998.50,
      status: 'In Stock',
    },
    {
      product: 'Smartphone Case',
      category: 'Accessories',
      currentStock: 15,
      minStock: 50,
      value: 374.85,
      status: 'Low Stock',
    },
    {
      product: 'Laptop Stand',
      category: 'Office Supplies',
      currentStock: 0,
      minStock: 10,
      value: 0,
      status: 'Out of Stock',
    },
  ];
  
  res.json({
    data: stockData,
    summary: {
      totalValue: stockData.reduce((sum, item) => sum + item.value, 0),
      lowStockItems: stockData.filter(item => item.status === 'Low Stock').length,
      outOfStockItems: stockData.filter(item => item.status === 'Out of Stock').length,
    },
  });
});

// Get user activity report
router.get('/activity', (req, res) => {
  const { startDate, endDate, userId } = req.query;
  
  // Mock activity data for report
  const activityData = [
    {
      date: '2024-01-15',
      user: 'Alice Johnson',
      action: 'Created Sale',
      details: 'Order #12345 - $2,500',
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      date: '2024-01-15',
      user: 'Bob Smith',
      action: 'Updated Customer',
      details: 'RetailMax Inc contact info',
      timestamp: '2024-01-15T09:15:00Z',
    },
    {
      date: '2024-01-14',
      user: 'Super Admin',
      action: 'Added Product',
      details: 'New Wireless Mouse',
      timestamp: '2024-01-14T16:45:00Z',
    },
  ];
  
  res.json({
    data: activityData,
    summary: {
      totalActivities: activityData.length,
      uniqueUsers: [...new Set(activityData.map(item => item.user))].length,
    },
  });
});

// Export report
router.get('/export/:type', (req, res) => {
  const { type } = req.params;
  const { format = 'csv' } = req.query;
  
  let data = [];
  let filename = '';
  
  switch (type) {
    case 'sales':
      data = [
        { date: '2024-01-15', salesPerson: 'Alice Johnson', revenue: 2500, orders: 5 },
        { date: '2024-01-14', salesPerson: 'Bob Smith', revenue: 1800, orders: 3 },
      ];
      filename = 'sales-report';
      break;
    case 'stock':
      data = [
        { product: 'Wireless Headphones', currentStock: 150, value: 14998.50 },
        { product: 'Smartphone Case', currentStock: 15, value: 374.85 },
      ];
      filename = 'stock-report';
      break;
    case 'activity':
      data = [
        { date: '2024-01-15', user: 'Alice Johnson', action: 'Created Sale' },
        { date: '2024-01-15', user: 'Bob Smith', action: 'Updated Customer' },
      ];
      filename = 'activity-report';
      break;
    default:
      return res.status(400).json({ message: 'Invalid report type' });
  }
  
  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(data);
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`${filename}.csv`);
    res.send(csv);
  } else {
    res.json(data);
  }
});

export default router;