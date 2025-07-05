# MongoDB Setup Guide for Windows

## Step 1: Install MongoDB Community Edition

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select "Windows" and "msi" package
   - Download the latest version

2. **Install MongoDB:**
   - Run the downloaded `.msi` file as Administrator
   - Choose "Complete" installation
   - Install MongoDB Compass when prompted (or download separately)
   - Complete the installation

## Step 2: Start MongoDB Service

### Option A: Using Services (Recommended)
1. Press `Win + R`, type `services.msc`, press Enter
2. Find "MongoDB" in the list
3. Right-click and select "Start"
4. Set "Startup Type" to "Automatic" for auto-start

### Option B: Using Command Prompt (as Administrator)
```cmd
net start MongoDB
```

### Option C: Manual Start
If the service doesn't exist, start MongoDB manually:
```cmd
"C:\Program Files\MongoDB\Server\[version]\bin\mongod.exe" --dbpath="C:\data\db"
```

## Step 3: Create Environment File

Create a `.env` file in your project root:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/sales-management

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=24h
```

## Step 4: Test MongoDB Connection

Run the test script:
```bash
npm run test:mongodb
```

You should see:
```
✅ MongoDB connection successful!
📊 Database: sales-management
🔗 Host: localhost
🚪 Port: 27017
```

## Step 5: Connect MongoDB Compass

1. **Open MongoDB Compass**
2. **Click "New Connection"**
3. **Enter Connection String:**
   ```
   mongodb://localhost:27017
   ```
4. **Click "Connect"**
5. **Navigate to your database:**
   - Click on `sales-management` database
   - If it doesn't exist, it will be created when you first insert data

## Step 6: Start Your Application

```bash
npm run mongodb:start
```

## Troubleshooting

### MongoDB Won't Start
1. **Check if MongoDB is installed:**
   ```cmd
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --version
   ```

2. **Create data directory:**
   ```cmd
   mkdir C:\data\db
   ```

3. **Check MongoDB logs:**
   - Look in Event Viewer > Windows Logs > Application
   - Search for MongoDB errors

### Connection Refused
1. **Verify MongoDB is running:**
   ```cmd
   netstat -an | findstr 27017
   ```

2. **Check firewall:**
   - Allow MongoDB through Windows Firewall
   - Port 27017 should be open

3. **Try different connection string:**
   ```
   mongodb://127.0.0.1:27017/sales-management
   ```

### Compass Connection Issues
1. **Verify MongoDB is running**
2. **Check connection string format**
3. **Try connecting to `127.0.0.1` instead of `localhost`**
4. **Ensure no antivirus is blocking the connection**

## Quick Start Commands

```bash
# Test MongoDB connection
npm run test:mongodb

# Start the application with MongoDB
npm run mongodb:start

# Start everything (if you have the dev script)
npm run dev
```

## MongoDB Compass Features

Once connected, you can:
- **Browse Collections:** View all your data
- **Add Documents:** Insert new data manually
- **Edit Documents:** Modify existing data
- **Query Data:** Use the query bar to filter data
- **Create Indexes:** Optimize database performance
- **Monitor Performance:** View query statistics

## Sample Data Structure

Your application will create collections like:
- `users` - User accounts and authentication
- `sales` - Sales transactions
- `customers` - Customer information
- `products` - Product catalog
- `reports` - Generated reports

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords in production
- Enable authentication for production databases
- Consider using MongoDB Atlas for production

## Next Steps

1. ✅ Install MongoDB
2. ✅ Start MongoDB service
3. ✅ Test connection
4. ✅ Connect MongoDB Compass
5. ✅ Start your application
6. 🎉 Explore your data in Compass! 