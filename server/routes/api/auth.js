import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../../config/database.js';
import { logActivity } from '../../utils/activityLogger.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sales person login (for mobile app)
router.post('/salesperson/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }
    
    // Find sales person
    const [users] = await pool.query(
      'SELECT * FROM sales_persons WHERE email = ? AND status = "active"',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }
    
    // Generate or get API key
    let apiKey = user.api_key;
    if (!apiKey) {
      apiKey = `sp_live_${crypto.randomBytes(16).toString('hex')}`;
      await pool.query(
        'UPDATE sales_persons SET api_key = ? WHERE id = ?',
        [apiKey, user.id]
      );
    }
    
    // Create or update API key record
    await pool.query(
      `INSERT INTO api_keys (key_name, api_key, api_secret, user_id, user_type, permissions) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE last_used = NOW(), status = 'active'`,
      [
        `${user.name} Mobile App`,
        apiKey,
        crypto.randomBytes(32).toString('hex'),
        user.id,
        'sales_person',
        JSON.stringify({
          read_customers: true,
          write_customers: true,
          read_orders: true,
          write_orders: true,
          read_products: true
        })
      ]
    );
    
    // Update last login
    await pool.query(
      'UPDATE sales_persons SET last_activity = NOW() WHERE id = ?',
      [user.id]
    );
    
    await logActivity(user.id, 'sales_person', 'login', 'Logged in via mobile app', req);
    
    // Return user data and API key
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      api_key: apiKey,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Sales person login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// Generate new API key
router.post('/salesperson/generate-key', async (req, res) => {
  try {
    const { email, password, key_name } = req.body;
    
    // Verify credentials
    const [users] = await pool.query(
      'SELECT * FROM sales_persons WHERE email = ? AND status = "active"',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate new API key
    const apiKey = `sp_live_${crypto.randomBytes(16).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');
    
    await pool.query(
      'INSERT INTO api_keys (key_name, api_key, api_secret, user_id, user_type, permissions) VALUES (?, ?, ?, ?, ?, ?)',
      [
        key_name || `${user.name} API Key`,
        apiKey,
        apiSecret,
        user.id,
        'sales_person',
        JSON.stringify({
          read_customers: true,
          write_customers: true,
          read_orders: true,
          write_orders: true,
          read_products: true
        })
      ]
    );
    
    await logActivity(user.id, 'sales_person', 'api_key_generated', `Generated new API key: ${key_name}`, req);
    
    res.json({
      api_key: apiKey,
      api_secret: apiSecret,
      message: 'API key generated successfully'
    });
    
  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// Revoke API key
router.delete('/salesperson/revoke-key/:keyId', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verify credentials
    const [users] = await pool.query(
      'SELECT * FROM sales_persons WHERE email = ? AND status = "active"',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Revoke API key
    await pool.query(
      'UPDATE api_keys SET status = "revoked" WHERE id = ? AND user_id = ?',
      [req.params.keyId, user.id]
    );
    
    await logActivity(user.id, 'sales_person', 'api_key_revoked', `Revoked API key ID: ${req.params.keyId}`, req);
    
    res.json({ message: 'API key revoked successfully' });
    
  } catch (error) {
    console.error('API key revocation error:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

export default router;