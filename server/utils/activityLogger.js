import pool from '../config/database.js';

export const logActivity = async (userId, userType, action, description, req = null) => {
  try {
    const ipAddress = req ? (req.ip || req.connection.remoteAddress) : null;
    const userAgent = req ? req.get('User-Agent') : null;
    
    await pool.query(
      'INSERT INTO activity_logs (user_id, user_type, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, userType, action, description, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};