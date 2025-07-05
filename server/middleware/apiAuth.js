import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// API Key authentication for sales persons
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required',
        message: 'Please provide a valid API key in the X-API-Key header or Authorization header'
      });
    }

    // Check if API key exists and is active
    const [apiKeyRows] = await pool.query(
      'SELECT ak.*, sp.id as user_id, sp.name, sp.email, sp.status FROM api_keys ak JOIN sales_persons sp ON ak.user_id = sp.id WHERE ak.api_key = ? AND ak.status = "active" AND sp.status = "active"',
      [apiKey]
    );

    if (apiKeyRows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked'
      });
    }

    const apiKeyData = apiKeyRows[0];

    // Check if API key has expired
    if (apiKeyData.expires_at && new Date() > new Date(apiKeyData.expires_at)) {
      return res.status(401).json({ 
        error: 'API key expired',
        message: 'The provided API key has expired'
      });
    }

    // Update last used timestamp
    await pool.query(
      'UPDATE api_keys SET last_used = NOW() WHERE id = ?',
      [apiKeyData.id]
    );

    // Attach user info to request
    req.user = {
      id: apiKeyData.user_id,
      name: apiKeyData.name,
      email: apiKeyData.email,
      role: 'sales_person',
      apiKeyId: apiKeyData.id,
      permissions: apiKeyData.permissions ? JSON.parse(apiKeyData.permissions) : {}
    };

    next();
  } catch (error) {
    console.error('API authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// JWT authentication for web app
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid JWT token'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'The provided token is invalid or has expired'
    });
  }
};

// Role-based authorization
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This endpoint requires one of the following roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

// Permission-based authorization for API keys
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This endpoint requires the '${permission}' permission`
      });
    }
    next();
  };
};