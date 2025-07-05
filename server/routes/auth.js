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
    console.log('Login request received:', { 
      email: req.body.email, 
      role: req.body.role,
      hasPassword: !!req.body.password 
    });

    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, role: !!role });
      return res.status(400).json({ 
        message: 'Missing required fields: email, password, and role are required.',
        error: 'validation_error'
      });
    }

    let user = null;
    let isValidPassword = false;

    if (role === 'sales_admin') {
      // Try MongoDB for sales admin first
      try {
        const SalesAdmin = (await import('../models/SalesAdmin.js')).default;
        const admin = await SalesAdmin.findOne({ email, status: 'active' });
        
        if (admin) {
          console.log('Found sales admin in MongoDB:', admin.email);
          isValidPassword = await bcrypt.compare(password, admin.password);
          
          if (isValidPassword) {
            user = {
              id: admin._id.toString(),
              email: admin.email,
              name: admin.name,
              role: 'sales_admin',
              isActive: admin.status === 'active'
            };
            
            // Update last login
            admin.lastLogin = new Date();
            await admin.save();
          }
        }
      } catch (mongoError) {
        console.log('MongoDB lookup failed, falling back to demo user:', mongoError.message);
      }
    }

    // Fallback to demo users if not found in MongoDB
    if (!user) {
      console.log('Looking for demo user with email:', email, 'and role:', role);
      const demoUser = users.find(u => u.email === email && u.role === role);
      
      if (demoUser) {
        console.log('Found demo user:', demoUser.email);
        isValidPassword = await bcrypt.compare(password, demoUser.password);
        
        if (isValidPassword) {
          user = {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            isActive: demoUser.isActive
          };
        }
      }
    }

    // Check if user was found and password is valid
    if (!user) {
      console.log('User not found for email:', email, 'role:', role);
      return res.status(401).json({ 
        message: 'Invalid credentials. Please check your email and role.',
        error: 'user_not_found'
      });
    }

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials. Please check your password.',
        error: 'invalid_password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is inactive:', email);
      return res.status(401).json({ 
        message: 'Your account has been deactivated. Please contact an administrator.',
        error: 'account_inactive'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', user.email, 'role:', user.role);

    // Return success response
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error during login',
      error: 'server_error'
    });
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

// Verify token endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded, valid: true });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', valid: false });
  }
});

export default router;