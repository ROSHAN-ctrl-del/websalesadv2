import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectMongoDB, MONGO_URI } from './config/mongodb.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import stockRoutes from './routes/stock.js';
import salesRoutes from './routes/sales.js';
import reportsRoutes from './routes/reports.js';
import customerRoutes from './routes/customers.js';
import salesAdminRoutes from './routes/salesAdmins.js';
import apiRoutes from './routes/api/index.js';

// Import middleware
import { authenticateToken, authenticateSocket } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// API Routes (public - no auth required for some endpoints)
app.use('/api', apiRoutes);

// Web App Routes (require JWT authentication)
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/stock', authenticateToken, stockRoutes);
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/customers', authenticateToken, customerRoutes);
app.use('/api/sales-admins', authenticateToken, salesAdminRoutes);

// Socket.IO for real-time features
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('User connected:', socket.user?.email);
  
  socket.join(`role_${socket.user?.role}`);
  
  // Handle real-time events
  socket.on('location_update', (data) => {
    if (socket.user?.role === 'sales_person') {
      socket.to(`role_sales_admin`).emit('salesperson_location', {
        salesperson_id: socket.user.id,
        location: data.location,
        timestamp: new Date()
      });
    }
  });
  
  socket.on('order_status_update', (data) => {
    socket.to(`role_sales_admin`).emit('order_update', {
      order_id: data.order_id,
      status: data.status,
      salesperson_id: socket.user.id,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user?.email);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'File too large',
      message: 'File size exceeds the maximum allowed limit'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Connect to MongoDB and start server
connectMongoDB().then((mongoConnected) => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    if (mongoConnected) {
      console.log(`🗄️  MongoDB Compass Connection: ${MONGO_URI}`);
    } else {
      console.log(`⚠️  MongoDB not connected - using fallback data`);
    }
  });
});

export { io };