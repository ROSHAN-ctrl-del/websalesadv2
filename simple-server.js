import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Server is running!' });
});

// Team members routes
app.get('/api/team-members', async (req, res) => {
  console.log('Fetching team members...');
  try {
    // Return some test data
    const testData = [
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1-555-1234',
        region: 'Test Region',
        status: 'active',
        currentLocation: 'Office',
        totalSales: 1000,
        dealsCount: 5,
        lastActivity: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Another User',
        email: 'another@example.com',
        phone: '+1-555-5678',
        region: 'Test Region 2',
        status: 'inactive',
        currentLocation: 'Remote',
        totalSales: 2000,
        dealsCount: 8,
        lastActivity: new Date().toISOString(),
      }
    ];
    
    console.log('Sending team members:', testData);
    res.json(testData);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

export default app;
