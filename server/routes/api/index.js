import express from 'express';
import salespersonRoutes from './salesperson.js';
import authRoutes from './auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
router.use(apiLimiter);

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Sales Management API',
    version: '1.0.0',
    description: 'RESTful API for Sales Management System',
    endpoints: {
      authentication: {
        'POST /api/auth/salesperson/login': 'Login for sales persons',
        'POST /api/auth/salesperson/generate-key': 'Generate new API key',
        'DELETE /api/auth/salesperson/revoke-key/:keyId': 'Revoke API key'
      },
      salesperson: {
        'GET /api/salesperson/profile': 'Get sales person profile',
        'PUT /api/salesperson/profile': 'Update sales person profile',
        'GET /api/salesperson/customers': 'Get assigned customers',
        'GET /api/salesperson/customers/:id': 'Get customer details',
        'PUT /api/salesperson/customers/:id': 'Update customer',
        'GET /api/salesperson/products': 'Get products catalog',
        'POST /api/salesperson/orders': 'Create new order',
        'GET /api/salesperson/orders': 'Get orders',
        'GET /api/salesperson/orders/:id': 'Get order details',
        'PATCH /api/salesperson/orders/:id/status': 'Update order status',
        'GET /api/salesperson/stats': 'Get sales statistics',
        'GET /api/salesperson/activity': 'Get activity log'
      }
    },
    authentication: {
      type: 'API Key',
      header: 'X-API-Key or Authorization: Bearer <api_key>',
      note: 'Use the API key obtained from login or generate-key endpoint'
    }
  });
});

// Mount route modules

import teamMembersRoutes from './team-members.js';
router.use('/auth', authRoutes);
router.use('/salesperson', salespersonRoutes);
router.use('/team-members', teamMembersRoutes);

export default router;