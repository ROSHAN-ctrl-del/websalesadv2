import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Demo users
const users = [
  {
    id: '1',
    email: 'superadmin@example.com',
    password: '$2a$10$AOp1dfGP60lqCUNGLYZRa.qNv/xy4lqE9CoOH/E1O3A8dNyjHE4au', // password: admin123
    name: 'Super Admin',
    role: 'super_admin',
    isActive: true,
  },
  {
    id: '2',
    email: 'salesadmin@example.com',
    password: '$2a$10$yQfrwpIoxK5/K4hDEaNLz.dM9cPKbOVSvlZ/8SobhIkgLuquLeJR2', // password: sales123
    name: 'Sales Admin',
    role: 'sales_admin',
    isActive: true,
  },
];

// Login (supports MongoDB sales admins)
router.post('/login', async (req, res) => {
  try {

    // Debug: log incoming request body for troubleshooting
    console.log('Login request body:', req.body);
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields: email, password, and role are required.', received: req.body });
    }

    if (role === 'sales_admin') {
      // Try MongoDB for sales admin
      try {
        const SalesAdmin = (await import('../models/SalesAdmin.js')).default;
        const admin = await SalesAdmin.findOne({ email });
        if (admin) {
          const isValidPassword = await bcrypt.compare(password, admin.password);
          if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
          // Generate JWT
          const token = jwt.sign(
            { id: admin._id, email: admin.email, role: 'sales_admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          const { password: _, ...adminWithoutPassword } = admin.toObject();
          return res.json({
            user: adminWithoutPassword,
            token,
          });
        }
        // If admin not found in MongoDB, fall through to demo user fallback below
      } catch (mongoError) {
        // fallback to demo user if MongoDB fails
      }
    }

    // Fallback to demo users for super_admin and sales_admin
    const user = users.find(u => u.email === email && u.role === role);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        reason: 'No user found for provided email and role',
        received: { email, role }
      });
    }
    // Check password using bcrypt for demo users
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        reason: 'Password mismatch',
        received: { email, role }
      });
    }
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Refresh token
router.post('/refresh', (req, res) => {
  // In a real app, you'd validate the refresh token
  res.json({ message: 'Token refreshed' });
});

export default router;