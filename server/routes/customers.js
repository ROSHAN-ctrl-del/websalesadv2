import express from 'express';

const router = express.Router();

// Demo customer data
let customers = [
  {
    id: '1',
    name: 'John Doe',
    company: 'TechCorp Solutions',
    email: 'john.doe@techcorp.com',
    phone: '+1-555-0301',
    address: '123 Tech Street, San Francisco, CA',
    totalOrders: 15,
    totalSpent: 25000,
    lastOrder: '2024-01-10T10:30:00Z',
    status: 'active',
    assignedTo: 'Alice Johnson',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    company: 'RetailMax Inc',
    email: 'sarah.wilson@retailmax.com',
    phone: '+1-555-0302',
    address: '456 Commerce Ave, New York, NY',
    totalOrders: 8,
    totalSpent: 12000,
    lastOrder: '2024-01-12T14:15:00Z',
    status: 'active',
    assignedTo: 'Bob Smith',
  },
  {
    id: '3',
    name: 'Mike Chen',
    company: 'StartupXYZ',
    email: 'mike.chen@startupxyz.com',
    phone: '+1-555-0303',
    address: '789 Innovation Blvd, Austin, TX',
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: '',
    status: 'potential',
    assignedTo: 'Charlie Brown',
  },
];

// Get all customers
router.get('/', (req, res) => {
  res.json(customers);
});

// Create new customer
router.post('/', (req, res) => {
  const newCustomer = {
    id: Date.now().toString(),
    ...req.body,
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: '',
    status: 'potential',
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Update customer
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const index = customers.findIndex(customer => customer.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  customers[index] = { ...customers[index], ...req.body };
  res.json(customers[index]);
});

// Delete customer
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  customers = customers.filter(customer => customer.id !== id);
  res.json({ message: 'Customer deleted successfully' });
});

export default router;