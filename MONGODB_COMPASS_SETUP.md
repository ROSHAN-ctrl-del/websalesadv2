# MongoDB Compass Integration Guide

## Prerequisites
- MongoDB installed and running locally
- MongoDB Compass installed
- Node.js project with MongoDB dependencies

## Step 1: Install MongoDB Dependencies

Make sure you have the required MongoDB packages installed:

```bash
npm install mongoose
```

## Step 2: Environment Setup

Create a `.env` file in your project root with the following variables:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/sales-management

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

## Step 3: Start Your MongoDB Server

### Option A: Local MongoDB Installation
1. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

### Option B: Using MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string and update `MONGO_URI` in `.env`

## Step 4: Connect MongoDB Compass

1. **Open MongoDB Compass**
2. **Click "New Connection"**
3. **Enter Connection String:**
   - For local MongoDB: `mongodb://localhost:27017`
   - For MongoDB Atlas: Use the connection string from Atlas dashboard
4. **Click "Connect"**

## Step 5: Navigate to Your Database

1. In Compass, you'll see all databases
2. Click on `sales-management` (or create it if it doesn't exist)
3. You can now view, edit, and manage your data through the GUI

## Step 6: Start Your Application

```bash
cd project
npm start
```

You should see output like:
```
✅ MongoDB connected successfully
📊 Database: sales-management
🔗 Connection URL: mongodb://localhost:27017/sales-management
🚀 Server running on port 5000
🗄️  MongoDB Compass Connection: mongodb://localhost:27017/sales-management
```

## Step 7: Create Sample Data (Optional)

You can create sample data directly in Compass or through your application. Here's a sample document structure:

```json
{
  "collection": "users",
  "document": {
    "email": "admin@example.com",
    "role": "super_admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Troubleshooting

### Connection Issues
1. **MongoDB not running**: Start MongoDB service
2. **Wrong port**: Default MongoDB port is 27017
3. **Authentication**: If using Atlas, ensure username/password are correct

### Compass Issues
1. **Can't connect**: Check if MongoDB is running
2. **Permission denied**: Ensure MongoDB is accessible
3. **SSL issues**: For Atlas, ensure SSL is enabled

## Useful Compass Features

1. **Data Explorer**: Browse and edit documents
2. **Schema Analysis**: Understand your data structure
3. **Performance**: Monitor query performance
4. **Indexes**: Manage database indexes
5. **Aggregation Pipeline Builder**: Create complex queries visually

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Enable authentication for production MongoDB instances
- Use MongoDB Atlas for production deployments

## Next Steps

1. Create your data models in `server/models/`
2. Set up your API routes
3. Test your database operations through Compass
4. Monitor your application's database usage 